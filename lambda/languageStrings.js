/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    "en-US" : {
        "SKILL_NAME": 'Random Holiday',
        "WELCOME_MESSAGE": 'Welcome! ',
        "MESSAGE": 'Here\'s your random holiday destination: ',
        "QUESTION": 'Do you want to ask me for a random holiday destination?',
        "HELP_MESSAGE": 'You can say ask me a holiday destination, or, you can say exit... What can I help you with?',
        "HELP_REPROMPT": 'What can I help you with?',
        "FALLBACK_MESSAGE": 'The Random Holiday skill can\'t help you with that.  It can help you discover a random holiday destination if you say tell me a holiday destination. What can I help you with?',
        "FALLBACK_REPROMPT": 'What can I help you with?',
        "ERROR_MESSAGE": 'Sorry, an error occurred.',
        "STOP_MESSAGE": 'Goodbye!',
        "LOCATION":[
            {
                "text": "Beijing",
                "image": "https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/intricate-chinese-architectural-design-of-a-colorful-temple-2846001.jpg"
            },
            {
                "text": "Vancouver",
                "image": "https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/photo-of-city-during-dawn-2782485.jpg"
            },
            {
                "text": "San Francisco",
                "image": "https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/america-architecture-bay-boat-208745.jpg"
            },
            {
                "text": "Tokyo",
                "image": "https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/low-angle-shot-of-the-tokyo-skytree-2187430.jpg"
            },
            {
                "text": "Paris",
                "image": "https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/picture-of-eiffel-tower-338515.jpg"
            }
        ]
    }
}