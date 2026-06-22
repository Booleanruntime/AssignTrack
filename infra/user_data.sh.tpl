#!/bin/bash
# Bootstrap for the EC2 instance running the AssignTrack backend, frontend, and self-hosted GitHub Actions runner.
#

set -eo pipefail

# --------------------------------------------------------------------------
#Swap — t3.micro has only 1GB RAM; npm install + CRA build + runner can OOM without it.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --------------------------------------------------------------------------
# 2. Base packages + Node 20 + PM2
# --------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git jq nginx rsync
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# --------------------------------------------------------------------------
# 3. App — clone, install backend, write .env, start under PM2 (live now)
# --------------------------------------------------------------------------
APP_DIR=/home/ubuntu/app
sudo -u ubuntu git clone https://github.com/${github_owner}/${github_repo}.git $APP_DIR

cat > $APP_DIR/backend/.env <<'PRODENV'
${prod_env}
PRODENV
chown ubuntu:ubuntu $APP_DIR/backend/.env

sudo -u ubuntu bash -c "cd $APP_DIR/backend && npm install && pm2 start server.js --name assigntrack-backend"
sudo -u ubuntu pm2 save
# Resurrect PM2 processes on reboot.
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# --------------------------------------------------------------------------
# 4. Frontend — build the React app, publish it, and serve it under PM2.
#    CRA reads NODE_ENV=production, so axiosConfig falls back to the relative
#    '/api' base, which nginx proxies to the backend below. The build is served
#    by PM2's built-in static server so the frontend is a managed process too.
# --------------------------------------------------------------------------
WEB_ROOT=/var/www/assigntrack
mkdir -p $WEB_ROOT
sudo -u ubuntu bash -c "cd $APP_DIR/frontend && npm ci && npm run build"
cp -r $APP_DIR/frontend/build/. $WEB_ROOT/
chown -R www-data:www-data $WEB_ROOT

# Serve the static build on :3000 under PM2 (--spa falls back to index.html for
# client-side routing). pm2 save so both tiers come back on reboot.
sudo -u ubuntu pm2 serve $WEB_ROOT 3000 --name assigntrack-frontend --spa
sudo -u ubuntu pm2 save

# --------------------------------------------------------------------------
# 5. nginx — edge reverse proxy: / to the PM2 static server :3000,
#    /api to the Node backend :5001 (HTTP only)
# --------------------------------------------------------------------------
cat > /etc/nginx/sites-available/assigntrack <<NGINX
server {
    listen 80 default_server;
    server_name _;

    # API requests go to the Node backend on :5001.
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Everything else is the React SPA, served by the PM2 'serve' process on :3000.
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/assigntrack /etc/nginx/sites-enabled/assigntrack
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --------------------------------------------------------------------------
# 6. GitHub Actions self-hosted runner (auto-registered via PAT)
# --------------------------------------------------------------------------
RUNNER_DIR=/home/ubuntu/actions-runner
RUNNER_VERSION=2.319.1
sudo -u ubuntu mkdir -p $RUNNER_DIR
cd $RUNNER_DIR
sudo -u ubuntu curl -o actions-runner.tar.gz -L \
  https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/actions-runner-linux-x64-$RUNNER_VERSION.tar.gz
sudo -u ubuntu tar xzf actions-runner.tar.gz

RUNNER_TOKEN=$(curl -sX POST \
  -H "Authorization: Bearer ${github_pat}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/${github_owner}/${github_repo}/actions/runners/registration-token \
  | jq -r .token)

sudo -u ubuntu ./config.sh --unattended \
  --url https://github.com/${github_owner}/${github_repo} \
  --token "$RUNNER_TOKEN" \
  --name "ec2-$(hostname)" \
  --labels self-hosted \
  --replace

./svc.sh install ubuntu
./svc.sh start

echo "Bootstrap complete."
