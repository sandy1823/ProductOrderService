FROM node:16-alpine
ENV TZ="Asia/Kolkata"
RUN date

WORKDIR /app

COPY package.json /app/

COPY .npmrc /app/

COPY . /app

#RUN rm package-lock.json

RUN npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "nJdg_axr9bUp16exMtg-"

RUN npm install @platform_jewels/bassure-node

RUN npm install

COPY . /app/

CMD ["npm","start"]
