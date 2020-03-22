FROM node:13

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install --production

# Coying the app
COPY . .

# Building the app
RUN yarn build

ENV API_URL=${API_URL}
ENV RECAPTCHA_KEY=${RECAPTCHA_KEY}

# Running the app
CMD [ "npm", "start" ]