let app = require("../app");
const PORT = process.env.PORT || 3018;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
// your express configuration here
