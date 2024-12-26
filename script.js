// Initialize vocabulary storage
const vocabularyStorage = {
    english: JSON.parse(localStorage.getItem('englishVocab')) || [],
    hungarian: JSON.parse(localStorage.getItem('hungarianVocab')) || [],
    french: JSON.parse(localStorage.getItem('frenchVocab')) || []
};

// Language Section Management
function showLanguageSection(language) {
    // Hide all sections first
    document.querySelectorAll('.language-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(`${language}Section`).classList.remove('hidden');

    // Reset and display words
    document.getElementById(`${language}TestArea`).classList.add('hidden');
    document.getElementById(`${language}WordList`).innerHTML = '';
    displayWords(language);
}

function showAddWordForm(language) {
    document.querySelectorAll('[id$="AddForm"]').forEach(form => {
        form.classList.add('hidden');
    });
    document.getElementById(`${language}AddForm`).classList.remove('hidden');
}

function saveWord(language) {
    let word, synonym;

    if (language === 'french') {
        word = document.getElementById('frenchWord').value.trim();
        synonym = document.getElementById('frenchArticle').value.trim();
    } else {
        word = document.getElementById(`${language}Word`).value.trim();
        synonym = document.getElementById(`${language}Synonym`).value.trim();
    }

    if (!word || !synonym) {
        alert('Please fill in all fields');
        return;
    }

    vocabularyStorage[language].push({ word, synonym });
    vocabularyStorage[language].sort((a, b) => a.word.localeCompare(b.word));
    localStorage.setItem(`${language}Vocab`, JSON.stringify(vocabularyStorage[language]));

    // Clear inputs
    document.getElementById(`${language}Word`).value = '';
    document.getElementById(language === 'french' ? 'frenchArticle' : `${language}Synonym`).value = '';

    displayWords(language);
}

function displayWords(language) {
    const wordList = document.getElementById(`${language}WordList`);
    wordList.innerHTML = '';

    vocabularyStorage[language].forEach(item => {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-item');
        wordDiv.textContent = `${item.word} - ${item.synonym}`;
        wordList.appendChild(wordDiv);
    });
}

function startTest(language) {
    const testArea = document.getElementById(`${language}TestArea`);
    const wordsColumn = document.getElementById(`${language}WordsColumn`);
    const synonymsColumn = document.getElementById(`${language}SynonymsColumn`);

    // Clear previous content and show test area
    wordsColumn.innerHTML = '<div class="test-column-header">Words</div>';
    synonymsColumn.innerHTML = `<div class="test-column-header">${language === 'french' ? 'Articles' : 'Synonyms'}</div>`;
    testArea.classList.remove('hidden');

    const vocab = vocabularyStorage[language];
    if (vocab.length < 4) {
        alert('Please add at least 4 words before starting the test');
        return;
    }

    const selectedWords = selectRandomWords(vocab, Math.min(vocab.length, 10));
    const words = selectedWords.map(item => item.word);
    const synonyms = selectedWords.map(item => item.synonym);

    // Add words to first column
    shuffle(words).forEach(word => {
        const div = document.createElement('div');
        div.classList.add('word-item');
        div.textContent = word;
        div.onclick = () => selectWord(div, language);
        wordsColumn.appendChild(div);
    });

    // Add synonyms to second column
    shuffle(synonyms).forEach(synonym => {
        const div = document.createElement('div');
        div.classList.add('word-item');
        div.textContent = synonym;
        div.onclick = () => selectWord(div, language);
        synonymsColumn.appendChild(div);
    });
}

function selectWord(div, language) {
    const testArea = document.getElementById(`${language}TestArea`);
    const selected = testArea.querySelectorAll('.selected');

    if (selected.length === 2) {
        selected.forEach(el => el.classList.remove('selected'));
    }

    div.classList.toggle('selected');
    const selectedElements = testArea.querySelectorAll('.selected');

    if (selectedElements.length === 2) {
        const [first, second] = selectedElements;
        const isMatch = vocabularyStorage[language].some(item => 
            (item.word === first.textContent && item.synonym === second.textContent) ||
            (item.word === second.textContent && item.synonym === first.textContent)
        );

        if (isMatch) {
            first.classList.add('matched');
            second.classList.add('matched');
            first.onclick = null;
            second.onclick = null;

            const allMatched = Array.from(testArea.querySelectorAll('.word-item'))
                .every(div => div.classList.contains('matched'));
            if (allMatched) {
                setTimeout(() => {
                    alert('Congratulations! You matched all pairs correctly!');
                }, 500);
            }
        }
        setTimeout(() => {
            selectedElements.forEach(el => el.classList.remove('selected'));
        }, 1000);
    }
}

function selectRandomWords(vocab, count) {
    return shuffle([...vocab]).slice(0, count);
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Test Start Functions
function startEnglishTest() { startTest('english'); }
function startHungarianTest() { startTest('hungarian'); }
function startFrenchTest() { startTest('french'); }

// Export/Import Functions
function exportData() {
    const data = JSON.stringify(vocabularyStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);

                // Validate and import data
                Object.keys(importedData).forEach(language => {
                    vocabularyStorage[language] = importedData[language];
                    localStorage.setItem(`${language}Vocab`, JSON.stringify(importedData[language]));
                });

                alert('Data imported successfully!');

                // Refresh current view
                const currentLanguage = ['english', 'hungarian', 'french'].find(lang => 
                    !document.getElementById(`${lang}Section`).classList.contains('hidden')
                );

                if (currentLanguage) {
                    displayWords(currentLanguage);
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Initialize first view
document.addEventListener('DOMContentLoaded', () => {
    showLanguageSection('english');
});