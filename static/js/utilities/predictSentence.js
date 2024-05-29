export default function predictSentence(str) {
    // Split the string into words
    let words = str.split(' ');
    // Calculate the ratio of words to text length
    let ratio = words.length / str.length;
    // If the ratio is over 0.11, it is likely a sentence
    if (ratio > 0.11) {
      return true;
    } else {
      return false;
    }
  }
