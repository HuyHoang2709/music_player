const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const USER_STORAGE_KEY = 'HUY_HOANG';

const dashboardHeader = $('.dashboard__header h2');
const cdThumb = $('.dashboard__cd-thumb');
const audio = $('#audio');
const cd = $('.dashboard__cd');
const player = $('.player');
const progress = $('#progress');
const playBtn = $('.btn-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeated: false,
    configs: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {},
    setConfigs: function(key, value) {
        this.configs[key] = value;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.configs));
    },
    loadConfigs: function () {
        this.isRandom = this.configs.isRandom;
        this.isRepeated = this.configs.isRepeated;
        repeatBtn.classList.toggle('active', this.isRepeated);
        randomBtn.classList.toggle('active', this.isRandom);
    },
    songs: [
        {
            name: 'Alone',
            singer: 'Alan Walker',
            path: './assets/musics/alone.mp3',
            image: './assets/img/alone.jpg'
        },
        {
            name: 'Energy',
            singer: 'Elektronomia',
            path: './assets/musics/energy.mp3',
            image: './assets/img/energy.jpg'
        },
        {
            name: 'Fade',
            singer: 'Alan Walker',
            path: './assets/musics/fade.mp3',
            image: './assets/img/fade.jpg'
        },
        {
            name: 'Legend',
            singer: 'The Score',
            path: './assets/musics/legend.mp3',
            image: './assets/img/legend.jpg'
        },
        {
            name: 'Nevada',
            singer: 'Vicestone',
            path: './assets/musics/nevada.mp3',
            image: './assets/img/nevada.jpg'
        },
        {
            name: 'Something Just Like This',
            singer: 'Coldplay',
            path: './assets/musics/somethingJustLikeThis.mp3',
            image: './assets/img/someThingJustLikeThis.jpg'
        },
        {
            name: 'Unstoppable',
            singer: 'The Score',
            path: './assets/musics/unstoppable.mp3',
            image: './assets/img/unstoppable.jpg'
        }
    ],
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="song__cd" style="background-image: url('${song.image}');"></div>
                    <div class="song__description">
                        <h2 class="song__name">${song.name}</h2>
                        <h4 class="song__singer-name">${song.singer}</h4>
                    </div>
                    <div class="song__option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });

        playlist.innerHTML = htmls.join('');
    },
    handleEvents: function() {
        // Change CD size onscroll
        const cdWidth = cd.clientWidth;

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // CD rotate animation function
        const cdAnimation = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdAnimation.pause();

        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Play - pause
        const _this = this;
        
            // when song is playing and when song has been paused
            audio.onplay = () => {
                _this.isPlaying = true;
                player.classList.add('playing');
                cdAnimation.play(); 
            }
            audio.onpause = () => {
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdAnimation.pause();
            }

        // Seek and run the track bar
        audio.addEventListener("timeupdate", timeUpdate);
        function timeUpdate(e) {
            if (audio.duration)
                progress.value = Math.floor((audio.currentTime / audio.duration) * 100);
        }

        progress.onmousedown = function (e) {
            audio.removeEventListener("timeupdate", timeUpdate);
        };
        progress.onmouseup = function (e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
            audio.addEventListener("timeupdate", timeUpdate);
        };

        // Next / Prev song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfigs('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Next / repeat song when prev song has ended
        repeatBtn.onclick = function() {
            _this.isRepeated = !_this.isRepeated;
            _this.setConfigs('isRepeated', _this.isRepeated);
            repeatBtn.classList.toggle('active', _this.isRepeated);
        }

        audio.onended = function() {
            if(_this.isRepeated) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Listen event when click on playlist
        playlist.onclick = function(e) {
            const clickSong = e.target.closest('.song:not(.active)');
            const option = e.target.closest('.song__option');
            if(clickSong || option) {
                // Handle when click on song
                if(clickSong) {
                    _this.currentIndex = Number(clickSong.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play()
                }

                // Handle when click on song option
                if(option) {
                    
                }
            }
        }
    },
    loadCurrentSong: function() {
        dashboardHeader.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    randomSong: function() {
        let newRandomIndex;
        do{
            newRandomIndex = Math.floor(Math.random() * this.songs.length);
        } while(newRandomIndex === this.currentIndex);
        this.currentIndex = newRandomIndex;
        this.loadCurrentSong();
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth', 
                block: 'end'
            });
        }, 300);
    },
    start: function() {
        // Load local configs
        this.loadConfigs();

        // Define basic properties for this object
        this.defineProperties();

        // Listen and handle events while using
        this.handleEvents();

        // Load current song's info to the UI
        this.loadCurrentSong();

        // Render all the songs to the playlist
        this.render();
    }
}

app.start();