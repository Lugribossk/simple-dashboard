FROM sinet/nginx-node:latest

COPY . /simple-dashboard
WORKDIR /simple-dashboard

RUN npm install -g grunt-cli && \
    npm install && \
    mv /simple-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

RUN grunt build
