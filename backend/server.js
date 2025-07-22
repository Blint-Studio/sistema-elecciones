const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = require('./app');

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});