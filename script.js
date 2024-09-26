let accumulatedResults = [];
let isRolling = false;
let rollingIntervals = [];

function rollDice() {
    const maxNumberInput = document.getElementById('max-number');
    let maxNumber = parseInt(maxNumberInput.value);

    // バリデーション
    if (isNaN(maxNumber) || maxNumber < 3 || maxNumber > 18) {
        alert('最大値は3から18の間で指定してください。');
        return;
    }

    if (isRolling) return;

    isRolling = true;

    // ボタンの状態を更新
    document.getElementById('roll-button').disabled = true;
    document.getElementById('show-result-button').disabled = false;

    // ダイス表示エリアを準備
    prepareDiceDisplay();

    // ランダムに数字をフラッシュさせる
    startRollingAnimation(maxNumber);
}

function prepareDiceDisplay() {
    const resultsContainer = document.getElementById('accumulated-results');

    const tempResultDiv = document.createElement('div');
    tempResultDiv.className = 'result-set temp';

    for (let i = 0; i < 3; i++) {
        const diceDiv = document.createElement('div');
        diceDiv.className = 'dice';
        diceDiv.textContent = '?';
        tempResultDiv.appendChild(diceDiv);
    }

    const existingTempDiv = document.querySelector('.result-set.temp');
    if (existingTempDiv) {
        resultsContainer.replaceChild(tempResultDiv, existingTempDiv);
    } else {
        resultsContainer.prepend(tempResultDiv);
    }
}

function startRollingAnimation(maxNumber) {
    const diceElements = document.querySelectorAll('.result-set.temp .dice');

    diceElements.forEach(dice => {
        const interval = setInterval(() => {
            dice.textContent = Math.floor(Math.random() * maxNumber) + 1;
        }, 100);
        rollingIntervals.push(interval);
    });
}

function showResult() {
    // アニメーションを停止
    rollingIntervals.forEach(interval => clearInterval(interval));
    rollingIntervals = [];

    const maxNumberInput = document.getElementById('max-number');
    let maxNumber = parseInt(maxNumberInput.value);

    // 1から最大値までの配列を作成
    let numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

    // シャッフルして先頭から3つを取得（重複なし）
    let shuffledNumbers = numbers.sort(() => 0.5 - Math.random());
    let selectedNumbers = shuffledNumbers.slice(0, 3);

    // 蓄積された結果の先頭に追加
    accumulatedResults.unshift(selectedNumbers);

    // 表示を更新
    updateAccumulatedResults();

    isRolling = false;

    // ボタンの状態を更新
    document.getElementById('roll-button').disabled = false;
    document.getElementById('show-result-button').disabled = true;
    document.getElementById('save-image-button').disabled = false; // 追加
}

function updateAccumulatedResults() {
    const resultsContainer = document.getElementById('accumulated-results');
    resultsContainer.innerHTML = ''; // 既存の内容をクリア

    accumulatedResults.forEach(resultSet => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-set';

        resultSet.forEach(number => {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'dice';
            numberDiv.textContent = number;
            resultDiv.appendChild(numberDiv);
        });

        resultsContainer.appendChild(resultDiv);
    });
}

function resetResults() {
    accumulatedResults = [];
    rollingIntervals.forEach(interval => clearInterval(interval));
    rollingIntervals = [];
    isRolling = false;
    document.getElementById('roll-button').disabled = false;
    document.getElementById('show-result-button').disabled = true;
    document.getElementById('save-image-button').disabled = true; // 追加
    const resultsContainer = document.getElementById('accumulated-results');
    resultsContainer.innerHTML = '';
}

function saveResultAsImage() {
    // 蓄積された結果全体を取得
    const resultsContainer = document.getElementById('accumulated-results');

    if (resultsContainer && resultsContainer.children.length > 0) {
        // 結果コンテナをクローン
        const clonedResults = resultsContainer.cloneNode(true);

        // ラッパー要素を作成
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block'; // サイズを合わせるため

        // クローンした結果をラッパーに追加
        wrapper.appendChild(clonedResults);

        // 透かし要素を作成
        const watermark = document.createElement('div');
        watermark.className = 'watermark';

        // 透かし文字を生成
        const lines = [];
        for (let i = 0; i < 50; i++) {
            lines.push('toa '.repeat(50));
        }
        const watermarkText = lines.join('\n');
        watermark.textContent = watermarkText;

        // ラッパーに透かしを追加
        wrapper.appendChild(watermark);

        // 一時的なコンテナを作成してラッパーを配置
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(wrapper);

        // 一時的なコンテナをDOMに追加（不可視にする）
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);

        // html2canvasでキャプチャ
        html2canvas(wrapper).then(canvas => {
            // 一時的なコンテナを削除
            document.body.removeChild(tempContainer);

            // Canvasから画像データを取得
            const dataURL = canvas.toDataURL('image/png');

            // ダウンロード用のリンクを作成
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'dice_results.png';

            // リンクをクリックしてダウンロードを実行
            link.click();
        });
    } else {
        alert('保存する結果がありません。');
    }
}

document.getElementById('roll-button').addEventListener('click', rollDice);
document.getElementById('show-result-button').addEventListener('click', showResult);
document.getElementById('reset-button').addEventListener('click', resetResults);
document.getElementById('save-image-button').addEventListener('click', saveResultAsImage);
