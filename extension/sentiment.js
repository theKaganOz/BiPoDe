// Inline tokenize function (replace this with the tokenize module's content)
var tokenize = function (input) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
};

// Inline languageProcessor (replace with the actual language data for English AFINN labels)
var languageProcessor = (function () {
    var languages = {
        en: {
            happy: 3,
            sad: -2,
            good: 2,
            bad: -2,
            amazing: 4,
            terrible: -4,
            love: 3,
            hate: -3
        }
    };

    return {
        getLabels: function (languageCode) {
            return languages[languageCode] || {};
        },
        addLanguage: function (languageCode, labels) {
            languages[languageCode] = labels;
        },
        applyScoringStrategy: function (languageCode, tokens, index, score) {
            // Example scoring strategy: no modification
            return score;
        }
    };
})();

/**
 * Constructor
 * @param {Object} options - Instance options
 */
var Sentiment = function (options) {
    this.options = options;
};

/**
 * Registers a language
 */
Sentiment.prototype.registerLanguage = function (languageCode, language) {
    languageProcessor.addLanguage(languageCode, language);
};

/**
 * Performs sentiment analysis
 */
Sentiment.prototype.analyze = function (phrase, opts) {
    if (typeof phrase === 'undefined') phrase = '';
    opts = opts || {};

    var languageCode = opts.language || 'en';
    var labels = languageProcessor.getLabels(languageCode);

    if (typeof opts.extras === 'object') {
        labels = Object.assign({}, labels, opts.extras);
    }

    var tokens = tokenize(phrase);
    var score = 0,
        words = [],
        positive = [],
        negative = [],
        calculation = [];

    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (!labels[token]) continue;

        var tokenScore = labels[token];
        tokenScore = languageProcessor.applyScoringStrategy(languageCode, tokens, i, tokenScore);

        if (tokenScore > 0) positive.push(token);
        if (tokenScore < 0) negative.push(token);

        score += tokenScore;
        words.push(token);

        var zipObj = {};
        zipObj[token] = tokenScore;
        calculation.push(zipObj);
    }

    return {
        score: score,
        comparative: tokens.length > 0 ? score / tokens.length : 0,
        calculation: calculation,
        tokens: tokens,
        words: words,
        positive: positive,
        negative: negative
    };
};

// Expose Sentiment globally
window.Sentiment = Sentiment;
