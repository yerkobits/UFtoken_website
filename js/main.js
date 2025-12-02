// ============================================
// Main JavaScript
// ============================================

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollAnimations();
        initSmoothScroll();
        initNavbarScroll();
        initICOModal();
        initAddTokenToWallet();
        initAuditContractLink();
    });

    // ============================================
    // Navigation
    // ============================================
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (navToggle) {
            navToggle.addEventListener('click', function() {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink();
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 10));
    }

    // ============================================
    // Smooth Scroll
    // ============================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            // Excluir el botón "Participar", "Listar en wallet" y "Auditar Contrato" del smooth scroll
            if (link.id === 'participar-btn' || link.id === 'listar-wallet-link' || link.id === 'audit-contract-link') {
                return;
            }

            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#' || href === '#!') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Scroll Animations
    // ============================================
    function initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            animateOnScrollFallback();
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;

                    setTimeout(function() {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, delay);

                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe all fade-in-up elements
        document.querySelectorAll('.fade-in-up[data-delay]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        });
    }

    function animateOnScrollFallback() {
        const animatedElements = document.querySelectorAll('.fade-in-up[data-delay]');

        function checkVisibility() {
            animatedElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const delay = parseInt(el.dataset.delay) || 0;
                    setTimeout(function() {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, delay);
                }
            });
        }

        window.addEventListener('scroll', throttle(checkVisibility, 100));
        checkVisibility();
    }

    // ============================================
    // Utility Functions
    // ============================================
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // Create canvas elements for Three.js
    // ============================================
    function createCanvasElements() {
        // Create particles canvas
        const particlesContainer = document.getElementById('particles-canvas');
        if (particlesContainer && !particlesContainer.querySelector('canvas')) {
            const particlesCanvas = document.createElement('canvas');
            particlesCanvas.id = 'particles-canvas';
            particlesContainer.appendChild(particlesCanvas);
        }

        // Create coin canvas
        const coinContainer = document.getElementById('coin-canvas');
        if (coinContainer && !coinContainer.querySelector('canvas')) {
            const coinCanvas = document.createElement('canvas');
            coinCanvas.id = 'coin-canvas';
            coinContainer.appendChild(coinCanvas);
        }
    }

    // Create canvas elements when DOM is ready
    document.addEventListener('DOMContentLoaded', createCanvasElements);

    // ============================================
    // ICO Modal
    // ============================================
    function initICOModal() {
        const modal = document.getElementById('ico-modal');
        const closeBtn = document.getElementById('ico-modal-close');
        const laterBtn = document.getElementById('ico-modal-later');

        if (!modal) return;

        // Modal oculto automáticamente - solo se muestra al hacer clic en "Participar"
        // Check if user has already dismissed the modal (using localStorage)
        // const modalDismissed = localStorage.getItem('ico-modal-dismissed');
        // const lastDismissTime = localStorage.getItem('ico-modal-dismissed-time');
        // const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours

        // Show modal if not dismissed or if dismissed more than 24 hours ago
        // if (!modalDismissed || (lastDismissTime && Date.now() - parseInt(lastDismissTime) > oneDayInMs)) {
        //     // Show modal after a short delay (1 second)
        //     setTimeout(function() {
        //         modal.classList.add('active');
        //         document.body.style.overflow = 'hidden';
        //     }, 1000);
        // }

        // Función para mostrar el modal
        function showModal() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Agregar event listener al botón "Participar" en el hero
        const participarBtn = document.getElementById('participar-btn');
        if (participarBtn) {
            participarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Evitar que otros event listeners se ejecuten
                showModal();
                return false;
            }, true); // Usar capture phase para ejecutarse antes que otros listeners
        }

        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Later button
        if (laterBtn) {
            laterBtn.addEventListener('click', function() {
                localStorage.setItem('ico-modal-dismissed', 'true');
                localStorage.setItem('ico-modal-dismissed-time', Date.now().toString());
                closeModal();
            });
        }

        // Close on overlay click
        const overlay = modal.querySelector('.ico-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ============================================
    // Add Token to Wallet
    // ============================================
    // Configuración de direcciones de token y contrato ICO (misma que en ICO)
    const TOKEN_CONFIG = {
        BSC_TESTNET_CHAIN_ID: '0x61', // 97 en decimal
        BSC_MAINNET_CHAIN_ID: '0x38', // 56 en decimal
        TOKEN_ADDRESS_TESTNET: '0xc55d62b0a249d54A5245307D6F06E0F0Cfb51C5F',
        TOKEN_ADDRESS_MAINNET: '0xE8fF85F773E462fBdF885b5652031B04368D8786',
        ICO_ADDRESS_TESTNET: '0xE63029b7DC7f96503b111cA53471Cf6d1bD2D2b3',
        ICO_ADDRESS_MAINNET: '0xAe91ed1bA4EA559B2CE15B4Aa383F8328585c29d'
    };

    // Función para detectar la red actual
    async function getCurrentNetwork() {
        if (typeof window.ethereum === 'undefined') {
            // Si no hay MetaMask, usar mainnet por defecto
            return {
                chainId: TOKEN_CONFIG.BSC_MAINNET_CHAIN_ID,
                tokenAddress: TOKEN_CONFIG.TOKEN_ADDRESS_MAINNET,
                icoAddress: TOKEN_CONFIG.ICO_ADDRESS_MAINNET,
                networkName: 'BSC Mainnet'
            };
        }

        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });

            if (chainId === TOKEN_CONFIG.BSC_MAINNET_CHAIN_ID) {
                return {
                    chainId: TOKEN_CONFIG.BSC_MAINNET_CHAIN_ID,
                    tokenAddress: TOKEN_CONFIG.TOKEN_ADDRESS_MAINNET,
                    icoAddress: TOKEN_CONFIG.ICO_ADDRESS_MAINNET,
                    networkName: 'BSC Mainnet'
                };
            } else if (chainId === TOKEN_CONFIG.BSC_TESTNET_CHAIN_ID) {
                return {
                    chainId: TOKEN_CONFIG.BSC_TESTNET_CHAIN_ID,
                    tokenAddress: TOKEN_CONFIG.TOKEN_ADDRESS_TESTNET,
                    icoAddress: TOKEN_CONFIG.ICO_ADDRESS_TESTNET,
                    networkName: 'BSC Testnet'
                };
            } else {
                // Red no soportada, usar mainnet por defecto
                return {
                    chainId: TOKEN_CONFIG.BSC_MAINNET_CHAIN_ID,
                    tokenAddress: TOKEN_CONFIG.TOKEN_ADDRESS_MAINNET,
                    icoAddress: TOKEN_CONFIG.ICO_ADDRESS_MAINNET,
                    networkName: 'BSC Mainnet'
                };
            }
        } catch (error) {
            console.error('Error obteniendo red actual:', error);
            // Fallback a mainnet
            return {
                chainId: TOKEN_CONFIG.BSC_MAINNET_CHAIN_ID,
                tokenAddress: TOKEN_CONFIG.TOKEN_ADDRESS_MAINNET,
                icoAddress: TOKEN_CONFIG.ICO_ADDRESS_MAINNET,
                networkName: 'BSC Mainnet'
            };
        }
    }

    // Función para agregar token a MetaMask
    async function addTokenToMetaMask() {
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask no está disponible. Por favor instala MetaMask para agregar el token.');
            return false;
        }

        try {
            // Obtener configuración de red actual
            const network = await getCurrentNetwork();
            const tokenAddress = network.tokenAddress;

            if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
                alert('⚠️ Dirección del token no configurada para esta red');
                return false;
            }

            // Información del token UF
            const tokenSymbol = 'UF';
            const tokenName = 'UF ICO_2026';
            const tokenDecimals = 4; // El token tiene 4 decimales
            const tokenImage = 'https://uftoken.cl/assets/logo.png'; // URL del logo

            // Agregar token a MetaMask usando wallet_watchAsset
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage,
                    },
                },
            });

            if (wasAdded) {
                console.log('✅ Token UF agregado exitosamente a MetaMask');
                alert('✅ Token UF agregado exitosamente a tu wallet');
                return true;
            } else {
                console.log('⚠️ Usuario canceló la adición del token');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al agregar token a MetaMask:', error);
            alert('Error al agregar token: ' + (error.message || 'Error desconocido'));
            return false;
        }
    }

    // Inicializar funcionalidad de agregar token
    function initAddTokenToWallet() {
        // Buscar el link "Listar en wallet" por su ID
        const listarWalletLink = document.getElementById('listar-wallet-link');
        if (listarWalletLink) {
            listarWalletLink.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                await addTokenToMetaMask();
                return false;
            }, true); // Usar capture phase para ejecutarse antes que otros listeners
        }
    }

    // ============================================
    // Update Audit Contract Link
    // ============================================
    // Función para actualizar el enlace de auditoría del contrato
    async function updateAuditContractLink() {
        const auditLink = document.getElementById('audit-contract-link');
        if (!auditLink) {
            console.warn('⚠️ No se encontró el enlace de auditoría en el DOM');
            return;
        }

        try {
            // Obtener configuración de red actual
            const network = await getCurrentNetwork();
            if (!network) {
                console.warn('⚠️ No se pudo obtener la configuración de red');
                auditLink.style.display = 'none';
                return;
            }

            const isTestnet = network.networkName === 'BSC Testnet';
            const contractAddress = network.icoAddress;

            if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                console.warn('⚠️ No hay dirección de contrato ICO configurada para', network.networkName);
                auditLink.style.display = 'none';
                return;
            }

            // Construir URL de BscScan
            const baseUrl = isTestnet
                ? 'https://testnet.bscscan.com'
                : 'https://bscscan.com';

            auditLink.href = `${baseUrl}/address/${contractAddress}`;
            auditLink.title = `Ver contrato ICO en ${network.networkName}`;
            // Asegurar que el enlace esté visible
            auditLink.style.display = '';
            console.log('✅ Enlace de auditoría actualizado:', auditLink.href);
        } catch (error) {
            console.error('Error actualizando enlace de auditoría:', error);
            auditLink.style.display = 'none';
        }
    }

    // Inicializar enlace de auditoría
    function initAuditContractLink() {
        // Actualizar inmediatamente
        updateAuditContractLink();
        // Reintentar después de un delay para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            updateAuditContractLink();
        }, 500);
        // Actualizar cuando cambie la red de MetaMask
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('chainChanged', function() {
                setTimeout(() => {
                    updateAuditContractLink();
                }, 1000);
            });
        }
    }
})();

