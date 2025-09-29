import { createAudioPlayer } from "expo-audio";

// Create global players once when module loads
const buttonDefaultPlayer = createAudioPlayer(
  require("../assets/sounds/90s_click.mp3")
);
const bgmPlayer = createAudioPlayer(require("../assets/sounds/bgm.mp3"));
bgmPlayer.loop = true;
bgmPlayer.volume = 0.5;

const joinPlayer = createAudioPlayer(require("../assets/sounds/join.mp3"));
const pickPlayer = createAudioPlayer(require("../assets/sounds/pick.mp3"));
const finishedPlayer = createAudioPlayer(
  require("../assets/sounds/finished2.mp3")
);

const countdownPlayer = createAudioPlayer(
  require("../assets/sounds/countdown.mp3")
);
countdownPlayer.volume = 1.0;

const Sounds = {
  buttonDefault: () => {
    buttonDefaultPlayer.seekTo(0);
    buttonDefaultPlayer.play();
  },
  join: () => {
    joinPlayer.seekTo(0);
    joinPlayer.play();
  },
  pick: () => {
    pickPlayer.seekTo(0);
    pickPlayer.play();
  },
  finished: () => {
    finishedPlayer.seekTo(0);
    finishedPlayer.play();
  },
  countdown: () => {
    countdownPlayer.seekTo(0);
    countdownPlayer.play();
  },
  playBgm: () => {
    bgmPlayer.play();
  },
};

export default Sounds;
