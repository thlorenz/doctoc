FROM alpine

ENTRYPOINT ["doctoc"]
CMD []

VOLUME /source

RUN apk -U add nodejs && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY . /app

RUN npm install -g doctoc

WORKDIR /source
