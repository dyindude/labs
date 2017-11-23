FROM alpine:latest

WORKDIR /app

COPY app/ /app/

RUN apk -Uuv add nodejs nodejs-npm && \
    npm install -g nodemon && \
    npm install

CMD [ "nodemon", "index.js" ]
