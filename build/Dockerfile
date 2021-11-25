ARG base=lastest
FROM trustcerts/trustchain-baseimage:${base}
ARG app

# copy built code
COPY ./dist/apps/${app}/main.js /app/dist/main.js
EXPOSE 3000
CMD ["node", "/app/dist/main.js"]
