FROM node:16 AS base

FROM base AS build
WORKDIR /opt
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS deps
WORKDIR /opt
COPY package*.json ./
RUN npm install --only=production

FROM base
RUN wget -q -O - dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get -y update
RUN apt-get install -y google-chrome-stable

WORKDIR /app
COPY --from=build /opt/dist .
COPY --from=deps /opt/node_modules node_modules

ENV DISPLAY=:1

ENV CHROME_PATH /usr/bin/google-chrome

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

CMD ["index.js"]