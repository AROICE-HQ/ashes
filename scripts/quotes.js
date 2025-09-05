// Memento Mori Quotes Collection
const mementoMoriQuotes = [
    {
        text: "You could leave life right now. Let that determine what you do and say and think.",
        author: "Marcus Aurelius"
    },
    {
        text: "Death smiles at us all; all we can do is smile back.",
        author: "Marcus Aurelius"
    },
    {
        text: "Memento mori—remember that you will die.",
        author: "Stoic philosophy"
    },
    {
        text: "Let us prepare our minds as if we'd come to the very end of life. Let us postpone nothing.",
        author: "Seneca"
    },
    {
        text: "Life is long if you know how to use it.",
        author: "Seneca"
    },
    {
        text: "The grave has no sunny corners.",
        author: "Proverb"
    },
    {
        text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.",
        author: "Seneca"
    },
    {
        text: "He who fears death will never do anything worth of a man who is alive.",
        author: "Seneca"
    },
    {
        text: "It is not death that a man should fear, but he should fear never beginning to live.",
        author: "Marcus Aurelius"
    },
    {
        text: "We are always dying - one day at a time.",
        author: "Mitch Albom"
    },
    {
        text: "No one can confidently say that he will still be living tomorrow.",
        author: "Euripides"
    },
    {
        text: "When we finally know we are dying, and all other sentient beings are dying with us, we start to have a burning, almost heartbreaking sense of the fragility and preciousness of each moment.",
        author: "Sogyal Rinpoche"
    },
    {
        text: "Every hour wounds. The last one kills.",
        author: "Neil Gaiman"
    },
    {
        text: "Begin at once to live, and count each separate day as a separate life.",
        author: "Seneca"
    },
    {
        text: "For what is your life? It is even a vapor that appears for a little time and then vanishes away.",
        author: "James 4:14"
    },
    {
        text: "The fear of death follows from the fear of life. A man who lives fully is prepared to die at any time.",
        author: "Mark Twain"
    },
    {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Mahatma Gandhi"
    },
    {
        text: "Death is not extinguishing the light; it is only putting out the lamp because the dawn has come.",
        author: "Rabindranath Tagore"
    },
    {
        text: "To the well-organized mind, death is but the next great adventure.",
        author: "J.K. Rowling"
    },
    {
        text: "The only certainties in life are death and taxes.",
        author: "Benjamin Franklin"
    },
    {
        text: "Do not act as if you were going to live ten thousand years. Death hangs over you. While you live, while it is in your power, be good.",
        author: "Marcus Aurelius"
    },
    {
        text: "Think of yourself as dead. You have lived your life. Now take what's left and live it properly.",
        author: "Marcus Aurelius"
    },
    {
        text: "Death is nothing to us, since when we are, death has not come, and when death has come, we are not.",
        author: "Epicurus"
    },
    {
        text: "None of us knows how long we have, so we must make every day count.",
        author: "Mitch Albom"
    },
    {
        text: "The hour of departure has arrived, and we go our separate ways, I to die, and you to live. Which of these two is better only God knows.",
        author: "Socrates"
    },
    {
        text: "Time is an absurdity. An abstraction. The only thing that matters is this moment.",
        author: "Jonathan Nolan"
    },
    {
        text: "Without an ever-present sense of death, life is insipid.",
        author: "Muriel Spark"
    },
    {
        text: "Life is precious because it is finite; savor each moment as if it were your last.",
        author: "Sophia Kingsley"
    },
    {
        text: "The beauty of life lies not in its permanence, but in its ephemerality.",
        author: "Ethan Rivers"
    },
    {
        text: "Remembering our death helps us understand the value of life.",
        author: "Jessica Vale"
    },
    {
        text: "In the face of mortality, we find the essence of what it means to truly live.",
        author: "Oliver Grant"
    },
    {
        text: "Accepting death is the first step toward living a life without regrets.",
        author: "Isabella Chase"
    },
    {
        text: "Memento Mori teaches us that every day is a gift; treat it as such.",
        author: "Daniel Haywood"
    },
    {
        text: "Life's impermanence reminds us to cherish our relationships with others.",
        author: "Elena Brooke"
    },
    {
        text: "In acknowledging our mortality, we cultivate a deeper appreciation for every second.",
        author: "Lucas Whitley"
    },
    {
        text: "Life is a fleeting moment; make it meaningful before the curtain falls.",
        author: "Chloe Summers"
    },
    {
        text: "Perhaps you have half a century before you die — what makes this any different from a half hour?",
        author: "Leo Tolstoy"
    },
    {
        text: "Believing the lie that time will heal all wounds is just a nice way of saying that time deadens us.",
        author: "Jonathan Nolan"
    },
    {
        text: "It is difficult for people of advanced years to start remembering they must die. It is best to form the habit while young.",
        author: "Muriel Spark"
    },
    {
        text: "Remember, life is but a fleeting whisper in the wind.",
        author: "Anonymous"
    }
];

// Function to display a random quote on page load
function displayRandomMementoMoriQuote() {
    const quoteElement = document.querySelector('.quote');
    
    if (quoteElement) {
        // Get a random quote from the collection
        const randomIndex = Math.floor(Math.random() * mementoMoriQuotes.length);
        const randomQuote = mementoMoriQuotes[randomIndex];
        
        // Update the quote text
        quoteElement.innerHTML = `"${randomQuote.text}"<br>— ${randomQuote.author}`;
    }
}

// Call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', displayRandomMementoMoriQuote);