        // Add interactive functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Anime and manga item hover effects
            const items = document.querySelectorAll('.anime-item, .manga-item');
            items.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Friend avatar interactions
            const friendAvatars = document.querySelectorAll('.friend-avatar');
            friendAvatars.forEach(avatar => {
                avatar.addEventListener('click', function() {
                    this.style.background = 'linear-gradient(45deg, #45b7d1, #96ceb4)';
                    setTimeout(() => {
                        this.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
                    }, 1000);
                });
            });

            // Stats counter animation
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const finalValue = parseInt(stat.textContent);
                let currentValue = 0;
                const increment = finalValue / 50;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        stat.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(currentValue);
                    }
                }, 30);
            });

            // Add click handlers for sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.addEventListener('click', function(e) {
                    if (e.target.classList.contains('anime-item') || e.target.classList.contains('manga-item')) {
                        console.log('Clicked on:', e.target.querySelector('.item-title').textContent);
                    }
                });
            });
        });