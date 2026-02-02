"use strict";
const app = require("./app");
const PORT = process.env.PORT || 5000;
// =============================
// Start Express Server
// =============================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
