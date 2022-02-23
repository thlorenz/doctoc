FROM node as builder

WORKDIR /app

COPY package.json package-lock.json doctoc.js ./

RUN npm install --prod

FROM astefanutti/scratch-node

COPY --from=builder /app /

ENTRYPOINT [ "node", "./doctoc.js" ]
