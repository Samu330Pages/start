var config = {
    apiKey: "AIzaSyCqsYZA9wU9Y1YvYGicdZQ_7DDzfEVLXDU",
    authDomain: "number-ac729.firebaseapp.com",
    projectId: "number-ac729",
    storageBucket: "number-ac729.appspot.com",
    messagingSenderId: "36610055964",
    appId: "1:36610055964:web:ec80cc7ea2fb23287ce4d9",
    measurementId: "G-0BTNK7VNM3"
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        displayRewards();
    } else {
        Swal.fire({
            title: 'Sin acceso',
            text: 'Debes iniciar sesión primero!',
            icon: 'warning',
            timer: 5000,
            showCancelButton: false,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "https://samu330.com/login/index";
        });
    }
});

const rewardsList = document.getElementById('rewards-list');
const jsonData = document.getElementById('json-data').querySelector('script').innerHTML;
const rewards = JSON.parse(jsonData);

function displayRewards() {
    rewardsList.innerHTML = '';
    rewards.forEach(reward => {
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'reward';
        rewardDiv.innerHTML = `${reward.name} <span>${reward.points} puntos</span><i class="fas fa-check" style="display: none;"></i>`;
        rewardDiv.onclick = () => handleRewardClick(reward);
        rewardsList.appendChild(rewardDiv);
    });
}

function handleRewardClick(reward) {
    const rewardDiv = Array.from(rewardsList.children).find(div => div.innerText.includes(reward.name));
    rewardDiv.classList.toggle('clicked');
    const icon = rewardDiv.querySelector('i');
    if (rewardDiv.classList.contains('clicked')) {
        navigator.clipboard.writeText('.rw ' + reward.code).then(() => {
            icon.style.display = 'inline';
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Copiaste el código!",
                showConfirmButton: false,
                timer: 1500
            });
        });
    } else {
        icon.style.display = 'none';
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const icon = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    document.getElementById('theme-toggle').innerHTML = `<i class="${icon}"></i>`;
});

document.oncontextmenu = function() {
    return false;
}
document.addEventListener("dragstart", function(event) {
    event.preventDefault();
});
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'u' || event.key === 'U')) {
        event.preventDefault();
        Swal.fire('Sin acceso?', 'Lo siento pero no tienes permiso', 'question');
    }
});
