import "./styles.css";
import { AppController } from "./app/AppController.js";

const appRoot = document.getElementById("app");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-btn");

if (!appRoot || !startScreen || !startButton) {
  throw new Error("Required root elements are missing.");
}

const appController = new AppController({
  container: appRoot,
  startScreen,
});

startButton.addEventListener("click", async () => {
  startScreen.style.display = "none";
  await appController.start();
});
