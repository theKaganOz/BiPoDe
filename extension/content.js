const sentiment = new Sentiment();

document.addEventListener("DOMContentLoaded", () => {
    analyzePageSentiments();
    highlightSentences();
});

function displayWidget(data) {
    const widgetHTML = `
        <div id="sentiment-widget" style="
            position:fixed; 
            top:10px; 
            right:10px; 
            background:#fff; 
            border:2px solid #444; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
            padding:15px; 
            font-family: Arial, sans-serif;
            z-index:1000;
            border-radius: 8px;
            color:#333;
        ">
            <h4 style="margin: 0 0 10px; text-align:center;">Sentiment Analysis</h4>
            <p><strong>Positive Sentences:</strong> ${data.no_positive}</p>
            <p><strong>Negative Sentences:</strong> ${data.no_negative}</p>
            <p><strong>Neutral Sentences:</strong> ${data.no_neutral}</p>
            <hr style="margin: 8px 0; border: 0.5px solid #ccc;">
            <p><strong>Sum Positive:</strong> ${data.sum_positive.toFixed(2)}</p>
            <p><strong>Sum Negative:</strong> ${data.sum_negative.toFixed(2)}</p>
            <p><strong>Sum Neutral:</strong> ${data.sum_neutral.toFixed(2)}</p>
            <hr style="margin: 8px 0; border: 0.5px solid #ccc;">
            <p><strong>Avg Positive:</strong> ${data.avg_positive.toFixed(2)}</p>
            <p><strong>Avg Negative:</strong> ${data.avg_negative.toFixed(2)}</p>
            <p><strong>Avg Neutral:</strong> ${data.avg_neutral.toFixed(2)}</p>
            <hr style="margin: 8px 0; border: 0.5px solid #ccc;">
            <p style="font-size: 1.1em;"><strong>Polarization Score:</strong> ${data.polarization_score.toFixed(2)}</p>
            <p style="font-size: 1.1em;"><strong>Overall Sentiment Score:</strong> ${data.overall_sentiment.toFixed(2)}</p>
        </div>
    `;
    const existingWidget = document.getElementById('sentiment-widget');
    if (existingWidget) existingWidget.remove();

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
}

async function analyzePageSentiments() {
    try {
        const pageText = Array.from(document.querySelectorAll('p, span, div'))
            .map(el => el.innerText)
            .join(' ');

        const response = await fetch('https://bipode-3ce18492867a.herokuapp.com/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: pageText })
        });

        if (!response.ok) {
            console.error('Error fetching sentiment data:', response.statusText);
            return;
        }

        const result = await response.json();
        displayWidget(result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function highlightSentences() {
    document.querySelectorAll('p').forEach(paragraph => {
        const sentences = paragraph.innerText.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)\s+/);
        let highlightedHTML = '';

        sentences.forEach(sentence => {
            const analysis = sentiment.analyze(sentence);
            let color = 'white';

            if (analysis.score > 2) color = 'lightgreen';
            else if (analysis.score < -2) color = 'lightcoral';
            else color = 'lightyellow';

            highlightedHTML += `<span style="background-color: ${color};" title="Score: ${analysis.score}">${sentence}</span> `;
        });

        paragraph.innerHTML = highlightedHTML;
    });
}
