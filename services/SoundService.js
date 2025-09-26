import { Audio } from 'expo-av';

class SoundService {
  constructor() {
    this.clickSound = null;
    this.setupClickSound();
  }

  async setupClickSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../sounds/90s_click.mp3'),
        {
          volume: 0.7, // Set click volume to 70%
          shouldPlay: false,
        }
      );
      this.clickSound = sound;
    } catch (error) {
      console.log('Error loading click sound:', error);
    }
  }

  async playClickSound() {
    try {
      if (this.clickSound) {
        // Stop any currently playing click sound and restart
        await this.clickSound.stopAsync();
        await this.clickSound.setPositionAsync(0);
        await this.clickSound.playAsync();
      }
    } catch (error) {
      console.log('Error playing click sound:', error);
    }
  }

  async cleanup() {
    try {
      if (this.clickSound) {
        await this.clickSound.unloadAsync();
        this.clickSound = null;
      }
    } catch (error) {
      console.log('Error cleaning up click sound:', error);
    }
  }
}

// Create a singleton instance
const soundService = new SoundService();

export default soundService;