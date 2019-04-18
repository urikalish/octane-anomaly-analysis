IF NOT EXIST .env COPY example\.env.example .env
IF NOT EXIST .settings.js COPY example\.settings.js.example .settings.js
npm i
