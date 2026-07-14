document.addEventListener('DOMContentLoaded', function(){
    const tocbox = document.querySelector('.toc-box');
    var headers = document.querySelectorAll('.subject-name');

    headers.forEach((h) => {
        let tocItem = document.createElement("li");
        tocItem.id = "toc-id-" + h.textContent;

        let itemLink = document.createElement("a");
        itemLink.classList.add("content-link");
        itemLink.textContent = h.textContent;

        tocItem.append(itemLink);

        tocItem.addEventListener('click', function(){
            h.scrollIntoView({
                behavior: 'smooth'
            });
        });

        tocbox.append(tocItem);
    });

    const skillsSection = document.querySelector('.subject.skills-section');
    const skillsSearch = document.getElementById('skills-search');

    if (skillsSection && skillsSearch) {
        const skillItems = Array.from(skillsSection.querySelectorAll('.item'));

        skillsSearch.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();

            skillItems.forEach(function(item) {
                const text = item.textContent.toLowerCase();
                const matches = text.includes(query);
                item.style.display = matches ? '' : 'none';
            });
        });
    }

    if (!document.querySelector('.lightbox-overlay')) {
        document.body.insertAdjacentHTML('beforeend', [
            '<div class="lightbox-overlay" hidden role="dialog" aria-modal="true" aria-label="Image viewer">',
            '  <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>',
            '  <button class="lightbox-nav lightbox-nav--prev" type="button" aria-label="Previous image">&#10094;</button>',
            '  <div class="lightbox-stage">',
            '    <img class="lightbox-image" src="" alt="">',
            '  </div>',
            '  <button class="lightbox-nav lightbox-nav--next" type="button" aria-label="Next image">&#10095;</button>',
            '</div>'
        ].join(''));
    }

    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
    const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
    const lightboxPrev = lightboxOverlay.querySelector('.lightbox-nav--prev');
    const lightboxNext = lightboxOverlay.querySelector('.lightbox-nav--next');
    let lightboxItems = [];
    let lightboxCurrentIndex = 0;
    let lightboxScrollY = 0;

    lightboxImage.addEventListener('load', function() {
        console.log('lightbox image loaded', lightboxImage.src);
    });

    lightboxImage.addEventListener('error', function() {
        console.error('lightbox image failed to load', lightboxImage.src);
    });

    function openLightbox(items, index) {
        console.log('openLightbox', index, items[index]);
        lightboxItems = items;
        lightboxCurrentIndex = index;
        lightboxScrollY = window.scrollY;
        lightboxImage.src = items[index].src;
        console.log('set image src', lightboxImage.src);
        lightboxImage.alt = items[index].alt;
        lightboxOverlay.hidden = false;
        console.log('overlay visible', !lightboxOverlay.hidden);
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxOverlay.hidden = true;
        document.body.style.overflow = '';
        window.scrollTo(0, lightboxScrollY);
    }

    function showLightboxItem(index) {
        if (!lightboxItems.length) return;
        const safeIndex = (index + lightboxItems.length) % lightboxItems.length;
        lightboxCurrentIndex = safeIndex;
        lightboxImage.src = lightboxItems[safeIndex].src;
        lightboxImage.alt = lightboxItems[safeIndex].alt;
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function() {
        showLightboxItem(lightboxCurrentIndex - 1);
    });
    lightboxNext.addEventListener('click', function() {
        showLightboxItem(lightboxCurrentIndex + 1);
    });
    lightboxOverlay.addEventListener('click', function(event) {
        if (event.target === lightboxOverlay) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', function(event) {
        if (lightboxOverlay.hidden) return;

        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowLeft') {
            showLightboxItem(lightboxCurrentIndex - 1);
        } else if (event.key === 'ArrowRight') {
            showLightboxItem(lightboxCurrentIndex + 1);
        }
    });

    document.querySelectorAll('.gallery').forEach(function(gallery) {
        const items = Array.from(gallery.querySelectorAll('.gallery-trigger')).map(function(button) {
            const img = button.querySelector('img');
            return {
                src: button.getAttribute('data-full') || img.getAttribute('src'),
                alt: button.getAttribute('data-alt') || img.getAttribute('alt') || ''
            };
        });

        if (!items.length) return;

        gallery.querySelectorAll('.gallery-trigger').forEach(function(button, index) {
            button.addEventListener('click', function() {
                console.log('gallery click', index, button.getAttribute('data-full'));
                openLightbox(items, index);
            });
        });
    });

    document.querySelectorAll('.experience-entry').forEach(function(entry) {
        const toggle = entry.querySelector('.experience-toggle');
        const details = entry.querySelector('.experience-details');

        if (!toggle || !details) return;

        function collapseDetails() {
            details.classList.remove('is-expanded');
            details.classList.add('is-collapsed');
            details.style.maxHeight = '0px';
            details.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Show Details';
        }

        function expandDetails() {
            details.classList.remove('is-collapsed');
            details.classList.add('is-expanded');
            details.style.maxHeight = details.scrollHeight + 'px';
            details.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.textContent = 'Hide';
        }

        collapseDetails();

        toggle.addEventListener('click', function() {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                collapseDetails();
            } else {
                expandDetails();
            }
        });

        window.addEventListener('resize', function() {
            if (details.classList.contains('is-expanded')) {
                details.style.maxHeight = details.scrollHeight + 'px';
            }
        });
    });

    var contents = document.querySelectorAll('.subject, .item');

    setInterval(function(){
        var scrollPos = document.documentElement.scrollTop;
        var wh = window.innerHeight;

        Array.from(tocbox.querySelectorAll('li')).forEach(function(tocItem){
            tocItem.classList.remove('active');
        });

        var currHead;

        Array.from(headers).forEach(function(h){
            let headPos = h.getBoundingClientRect().top + window.scrollY - wh/2;

            if (scrollPos > headPos) currHead = h;
        });

        Array.from(contents).forEach(function(c){
            let contentPos = c.getBoundingClientRect().top + window.scrollY - wh;

            if (c.classList.contains("appear")) return;

            if (scrollPos < contentPos) return;

            c.classList.add('appear');
        });

        if (currHead != undefined){
            let tocLink = document.getElementById("toc-id-" + currHead.textContent);
            tocLink.classList.add('active');
        }
    }, 200);
});