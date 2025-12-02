// ============================================
// ICO Web3 Integration
// ============================================

// Configuración de contratos (actualizar con direcciones reales después del deployment)
const CONFIG = {
    // Configuración de redes
    BSC_TESTNET_CHAIN_ID: '0x61', // 97 en decimal
    BSC_MAINNET_CHAIN_ID: '0x38', // 56 en decimal
    // Múltiples RPCs para mejor rendimiento y redundancia
    BSC_TESTNET_RPC: [
        'https://data-seed-prebsc-1-s1.binance.org:8545/',
        'https://data-seed-prebsc-2-s1.binance.org:8545/',
        'https://bsc-testnet.publicnode.com'
    ],
    BSC_MAINNET_RPC: [
        'https://bsc-dataseed1.binance.org/',
        'https://bsc-dataseed2.binance.org/',
        'https://bsc-dataseed3.binance.org/',
        'https://bsc-dataseed4.binance.org/',
        'https://bsc-dataseed1.defibit.io/',
        'https://bsc-dataseed1.nodereal.io',
        'https://bsc.publicnode.com'
    ],

    // Direcciones de contratos - Testnet
    TOKEN_ADDRESS_TESTNET: '0xc55d62b0a249d54A5245307D6F06E0F0Cfb51C5F', // UFtokenICO2026 desplegado (4 decimales)
    ICO_ADDRESS_TESTNET: '0xE63029b7DC7f96503b111cA53471Cf6d1bD2D2b3', // ICO2026 desplegado
    USDT_ADDRESS_TESTNET: '0x3A2E96dDBf9B750D171A547A50C5F1D6748E9C9C', // Mock USDT desplegado

    // Direcciones de contratos - Mainnet (ACTUALIZAR DESPUÉS DEL DEPLOYMENT)
    TOKEN_ADDRESS_MAINNET: '0xE8fF85F773E462fBdF885b5652031B04368D8786', // ACTUALIZAR después del deployment
    ICO_ADDRESS_MAINNET: '0xAe91ed1bA4EA559B2CE15B4Aa383F8328585c29d', // ACTUALIZAR después del deployment
    USDT_ADDRESS_MAINNET: '0x55d398326f99059fF775485246999027B3197955', // USDT real en BSC Mainnet

    // Precios
    PRICE_BNB: '0.045', // Precio inicial en BNB por UF (se actualizará dinámicamente)
    PRICE_USDT: '38.24', // Precio inicial en USDT por UF (se calculará según precio UF)

    // URL del backend API - Se obtiene de BACKEND_CONFIG (config.js)
    // Si BACKEND_CONFIG no está disponible, usar valor por defecto
    API_BASE_URL: (typeof BACKEND_CONFIG !== 'undefined' && BACKEND_CONFIG.API_BASE_URL)
        ? BACKEND_CONFIG.API_BASE_URL
        : 'http://localhost:3000' // Fallback por defecto
};

// Función para obtener la preferencia de red desde la URL
function getPreferredNetworkFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const chainParam = urlParams.get('chain');

    // Si hay ?chain=testnet en la URL, usar Testnet
    if (chainParam === 'testnet') {
        return 'testnet';
    }

    // Por defecto, usar Mainnet
    return 'mainnet';
}

// Función para obtener configuración según la red actual
function getNetworkConfig() {
    // Obtener preferencia desde URL (por defecto: mainnet)
    const preferredNetwork = getPreferredNetworkFromURL();

    // Detectar red actual (si MetaMask está disponible)
    if (typeof window.ethereum !== 'undefined') {
        // Esta función se actualizará cuando se conecte la wallet
        return getCurrentNetworkConfig();
    }

    // Por defecto, usar Mainnet (a menos que URL especifique testnet)
    if (preferredNetwork === 'testnet') {
        return {
            chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
            rpc: CONFIG.BSC_TESTNET_RPC[0], // Usar primer RPC por defecto
            rpcList: CONFIG.BSC_TESTNET_RPC, // Lista completa para fallback
            tokenAddress: CONFIG.TOKEN_ADDRESS_TESTNET,
            icoAddress: CONFIG.ICO_ADDRESS_TESTNET,
            usdtAddress: CONFIG.USDT_ADDRESS_TESTNET,
            networkName: 'BSC Testnet'
        };
    } else {
        return {
            chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
            rpc: CONFIG.BSC_MAINNET_RPC[0], // Usar primer RPC por defecto
            rpcList: CONFIG.BSC_MAINNET_RPC, // Lista completa para fallback
            tokenAddress: CONFIG.TOKEN_ADDRESS_MAINNET,
            icoAddress: CONFIG.ICO_ADDRESS_MAINNET,
            usdtAddress: CONFIG.USDT_ADDRESS_MAINNET,
            networkName: 'BSC Mainnet'
        };
    }
}

// Función para obtener configuración de la red actual (después de conectar wallet)
async function getCurrentNetworkConfig() {
    try {
        // Obtener preferencia desde URL (por defecto: mainnet)
        const preferredNetwork = getPreferredNetworkFromURL();

        if (typeof window.ethereum === 'undefined') {
            // Si no hay MetaMask, usar preferencia de URL
            return getNetworkConfig();
        }

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isMainnet = chainId === CONFIG.BSC_MAINNET_CHAIN_ID;
        const isTestnet = chainId === CONFIG.BSC_TESTNET_CHAIN_ID;

        // Si MetaMask está en una red soportada, usar esa red
        if (isMainnet) {
            // Verificar si la URL pide testnet pero MetaMask está en mainnet
            if (preferredNetwork === 'testnet') {
                console.warn('⚠️ URL solicita Testnet pero MetaMask está en Mainnet. Usando Mainnet.');
            }
            return {
                chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
                rpc: CONFIG.BSC_MAINNET_RPC[0],
                rpcList: CONFIG.BSC_MAINNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_MAINNET,
                icoAddress: CONFIG.ICO_ADDRESS_MAINNET,
                usdtAddress: CONFIG.USDT_ADDRESS_MAINNET,
                networkName: 'BSC Mainnet'
            };
        } else if (isTestnet) {
            // Verificar si la URL pide mainnet pero MetaMask está en testnet
            if (preferredNetwork === 'mainnet') {
                console.warn('⚠️ URL solicita Mainnet pero MetaMask está en Testnet. Usando Testnet.');
            }
            return {
                chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
                rpc: CONFIG.BSC_TESTNET_RPC[0],
                rpcList: CONFIG.BSC_TESTNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_TESTNET,
                icoAddress: CONFIG.ICO_ADDRESS_TESTNET,
                usdtAddress: CONFIG.USDT_ADDRESS_TESTNET,
                networkName: 'BSC Testnet'
            };
        } else {
            // MetaMask está en una red no soportada, usar preferencia de URL
            console.warn('⚠️ MetaMask está en una red no soportada. Usando preferencia de URL:', preferredNetwork);
            if (preferredNetwork === 'testnet') {
                return {
                    chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
                    rpc: CONFIG.BSC_TESTNET_RPC[0],
                    rpcList: CONFIG.BSC_TESTNET_RPC,
                    tokenAddress: CONFIG.TOKEN_ADDRESS_TESTNET,
                    icoAddress: CONFIG.ICO_ADDRESS_TESTNET,
                    usdtAddress: CONFIG.USDT_ADDRESS_TESTNET,
                    networkName: 'BSC Testnet'
                };
            } else {
                return {
                    chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
                    rpc: CONFIG.BSC_MAINNET_RPC[0],
                    rpcList: CONFIG.BSC_MAINNET_RPC,
                    tokenAddress: CONFIG.TOKEN_ADDRESS_MAINNET,
                    icoAddress: CONFIG.ICO_ADDRESS_MAINNET,
                    usdtAddress: CONFIG.USDT_ADDRESS_MAINNET,
                    networkName: 'BSC Mainnet'
                };
            }
        }
    } catch (error) {
        console.error('Error obteniendo configuración de red:', error);
        // Fallback a preferencia de URL (por defecto: mainnet)
        const preferredNetwork = getPreferredNetworkFromURL();
        if (preferredNetwork === 'testnet') {
            return {
                chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
                rpc: CONFIG.BSC_TESTNET_RPC[0],
                rpcList: CONFIG.BSC_TESTNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_TESTNET,
                icoAddress: CONFIG.ICO_ADDRESS_TESTNET,
                usdtAddress: CONFIG.USDT_ADDRESS_TESTNET,
                networkName: 'BSC Testnet'
            };
        } else {
            return {
                chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
                rpc: CONFIG.BSC_MAINNET_RPC[0],
                rpcList: CONFIG.BSC_MAINNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_MAINNET,
                icoAddress: CONFIG.ICO_ADDRESS_MAINNET,
                usdtAddress: CONFIG.USDT_ADDRESS_MAINNET,
                networkName: 'BSC Mainnet'
            };
        }
    }
}

// Variables globales para configuración actual
let currentNetworkConfig = getNetworkConfig();

// Precio actual de la UF (se obtiene desde API)
// Precio mínimo de UF para fallback cuando no hay API disponible (en CLP)
const MIN_UF_PRICE_CLP = 39700; // Precio mínimo solo como fallback cuando API no está disponible

let currentUFPrice = null; // Precio de 1 UF en CLP
let currentBNBPriceCLP = null; // Precio de 1 BNB en CLP

let provider = null;
let signer = null;
let icoContract = null;
let tokenContract = null;
let usdtContract = null;
let userAddress = null;

// Provider y contrato de solo lectura para estadísticas (sin wallet)
let readOnlyProvider = null;
let readOnlyICOContract = null;

// Constante para decimales del token (4 decimales)
const TOKEN_DECIMALS = 4;

// ABI simplificado para ICO
const ICO_ABI = [
    "function buyWithBNB(uint256 newPriceInBNB) payable",
    "function buyWithUSDT(uint256 usdtAmount)",
    "function updatePriceInBNB(uint256 newPriceInBNB)",
    "function getICOInfo() view returns (uint256, uint256, uint256, uint256, uint256, bool, bool, uint256)",
    "function icoActive() view returns (bool)",
    "function priceInBNB() view returns (uint256)",
    "function priceInUSDT() view returns (uint256)",
    "function hardCap() view returns (uint256)",
    "function softCap() view returns (uint256)",
    "event TokensPurchased(address indexed buyer, uint256 amountBNB, uint256 amountUSDT, uint256 tokens)",
    "event PriceUpdated(uint256 oldPrice, uint256 newPrice)"
];

// ABI simplificado para ERC20
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Función para actualizar el enlace de auditoría del contrato
function updateAuditContractLink() {
    const auditLink = document.getElementById('audit-contract-link');
    if (!auditLink) {
        console.warn('⚠️ No se encontró el enlace de auditoría en el DOM');
        return;
    }

    // Obtener configuración de red actual
    const networkConfig = getNetworkConfig();
    if (!networkConfig) {
        console.warn('⚠️ No se pudo obtener la configuración de red');
        auditLink.style.display = 'none';
        return;
    }

    const isTestnet = networkConfig.networkName === 'BSC Testnet';
    const contractAddress = networkConfig.icoAddress;

    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ No hay dirección de contrato ICO configurada para', networkConfig.networkName);
        auditLink.style.display = 'none';
        return;
    }

    // Construir URL de BscScan
    const baseUrl = isTestnet
        ? 'https://testnet.bscscan.com'
        : 'https://bscscan.com';

    auditLink.href = `${baseUrl}/address/${contractAddress}`;
    auditLink.title = `Ver contrato ICO en ${networkConfig.networkName}`;
    // Asegurar que el enlace esté visible
    auditLink.style.display = '';
    console.log('✅ Enlace de auditoría actualizado:', auditLink.href);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async function () {
    // Mostrar estado de carga en la UI inmediatamente
    const statusEl = document.getElementById('ico-status');
    if (statusEl) {
        statusEl.textContent = 'Cargando...';
    }

    // Inicializar estadísticas primero (sin wallet) - esto es lo más importante
    // NO esperar, ejecutar en paralelo con otras inicializaciones
    initReadOnlyContracts().catch(error => {
        console.error('Error inicializando contratos de solo lectura:', error);
        // Intentar de nuevo después de un delay
        setTimeout(() => {
            console.log('🔄 Reintentando inicializar contratos de solo lectura...');
            initReadOnlyContracts();
        }, 3000);
    });

    // Actualizar enlace de auditoría
    updateAuditContractLink();
    // Reintentar después de un pequeño delay para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        updateAuditContractLink();
    }, 500);

    // Inicializar otras cosas en paralelo
    initICO();
    loadUFPrice(); // Cargar precio de la UF
    setupEventListeners();

    // Actualizar estadísticas inmediatamente (se actualizará cuando los contratos estén listos)
    // También intentar actualizar después de un delay para asegurar que se cargue
    setTimeout(() => {
        updateICOStats();
        // Actualizar enlace de auditoría nuevamente después de que todo esté inicializado
        updateAuditContractLink();
    }, 2000);

    // Configurar intervalos de actualización
    setInterval(updateICOStats, 30000); // Actualizar cada 30 segundos
    setInterval(loadUFPrice, 3600000); // Actualizar precio UF cada hora

    // Configurar listeners de MetaMask después de que la página cargue
    // Esto asegura que MetaMask esté disponible
    setupMetaMaskListeners();
});

// Inicializar contratos de solo lectura para estadísticas (sin wallet)
async function initReadOnlyContracts() {
    try {
        // Obtener configuración de red actual
        // IMPORTANTE: No usar getCurrentNetworkConfig() aquí porque es asíncrona y puede depender de MetaMask
        // Usar getNetworkConfig() que devuelve configuración sincrónica basada en preferencia de URL
        const preferredNetwork = getPreferredNetworkFromURL();

        if (preferredNetwork === 'testnet') {
            currentNetworkConfig = {
                chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
                rpc: CONFIG.BSC_TESTNET_RPC[0],
                rpcList: CONFIG.BSC_TESTNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_TESTNET,
                icoAddress: CONFIG.ICO_ADDRESS_TESTNET,
                usdtAddress: CONFIG.USDT_ADDRESS_TESTNET,
                networkName: 'BSC Testnet'
            };
        } else {
            // Por defecto usar Mainnet
            currentNetworkConfig = {
                chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
                rpc: CONFIG.BSC_MAINNET_RPC[0],
                rpcList: CONFIG.BSC_MAINNET_RPC,
                tokenAddress: CONFIG.TOKEN_ADDRESS_MAINNET,
                icoAddress: CONFIG.ICO_ADDRESS_MAINNET,
                usdtAddress: CONFIG.USDT_ADDRESS_MAINNET,
                networkName: 'BSC Mainnet'
            };
        }

        console.log('🌐 Configuración de red para contratos de solo lectura:', currentNetworkConfig.networkName);

        // Verificar que la dirección del contrato ICO esté configurada
        if (!currentNetworkConfig.icoAddress || currentNetworkConfig.icoAddress === '0x0000000000000000000000000000000000000000') {
            console.warn('⚠️ ICO_ADDRESS no está configurado para', currentNetworkConfig.networkName);
            console.warn('📍 Configuración actual:', {
                network: currentNetworkConfig.networkName,
                icoAddress: currentNetworkConfig.icoAddress,
                tokenAddress: currentNetworkConfig.tokenAddress
            });
            const statusEl = document.getElementById('ico-status');
            if (statusEl) {
                statusEl.textContent = 'No configurado';
            }
            // También mostrar en consola para debugging
            console.error('❌ No se puede inicializar contratos de solo lectura: ICO_ADDRESS no configurado');
            return;
        }

        console.log('✅ Dirección ICO encontrada:', currentNetworkConfig.icoAddress, 'en', currentNetworkConfig.networkName);

        // Intentar crear provider con múltiples RPCs como fallback
        const rpcList = currentNetworkConfig.rpcList || [currentNetworkConfig.rpc];
        let providerCreated = false;

        for (let i = 0; i < rpcList.length; i++) {
            try {
                const rpcUrl = rpcList[i];
                console.log(`🔄 Intentando conectar a RPC ${i + 1}/${rpcList.length}: ${rpcUrl}`);

                // Crear provider con timeout más corto para mejor rendimiento
                // Usar StaticJsonRpcProvider que es más rápido para solo lectura
                readOnlyProvider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);

                // Probar el provider haciendo una llamada simple con timeout
                await Promise.race([
                    readOnlyProvider.getBlockNumber(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);

                console.log(`✅ Provider de solo lectura creado exitosamente con RPC ${i + 1}:`, currentNetworkConfig.networkName);
                providerCreated = true;
                break; // Si funciona, salir del loop
            } catch (rpcError) {
                console.warn(`⚠️ RPC ${i + 1} falló:`, rpcError.message);
                if (i === rpcList.length - 1) {
                    // Si es el último RPC y falla, lanzar error
                    throw new Error('Todos los RPCs fallaron');
                }
                // Continuar con el siguiente RPC
            }
        }

        if (!providerCreated) {
            throw new Error('No se pudo conectar a ningún RPC');
        }

        // Crear contrato ICO de solo lectura
        readOnlyICOContract = new ethers.Contract(
            currentNetworkConfig.icoAddress,
            ICO_ABI,
            readOnlyProvider
        );
        console.log('✅ Contrato ICO de solo lectura inicializado:', currentNetworkConfig.icoAddress);

        // Actualizar estadísticas inmediatamente con timeout
        try {
            await Promise.race([
                updateICOStats(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout actualizando estadísticas')), 10000))
            ]);
        } catch (statsError) {
            console.error('⚠️ Error o timeout actualizando estadísticas:', statsError.message);
            // Mostrar mensaje de error en la UI
            const statusEl = document.getElementById('ico-status');
            if (statusEl) {
                statusEl.textContent = 'Error al cargar';
            }
        }
    } catch (error) {
        console.error('❌ Error inicializando contratos de solo lectura:', error);
        // Mostrar mensaje de error en la UI
        const statusEl = document.getElementById('ico-status');
        if (statusEl) {
            statusEl.textContent = 'Error de conexión';
        }
    }
}

async function initICO() {
    // Verificar si hay wallet conectada
    // MetaMask puede tardar en cargar, especialmente en archivos locales
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detectado en initICO');
        // Actualizar configuración de red antes de verificar conexión
        try {
            currentNetworkConfig = await getCurrentNetworkConfig();
            console.log('🌐 Red detectada al inicio:', currentNetworkConfig.networkName);
        } catch (error) {
            console.warn('⚠️ No se pudo detectar la red al inicio:', error);
        }
        checkWalletConnection();
    } else {
        console.log('⚠️ MetaMask no detectado en initICO, esperando...');
        showWalletNotInstalled();

        // Reintentar después de un delay por si MetaMask se está cargando
        setTimeout(async () => {
            if (typeof window.ethereum !== 'undefined') {
                console.log('✅ MetaMask detectado después de esperar');
                // Actualizar configuración de red
                try {
                    currentNetworkConfig = await getCurrentNetworkConfig();
                    console.log('🌐 Red detectada después de esperar:', currentNetworkConfig.networkName);
                } catch (error) {
                    console.warn('⚠️ No se pudo detectar la red:', error);
                }
                checkWalletConnection();
            } else {
                console.log('❌ MetaMask no está disponible');
            }
        }, 1000);
    }
}

function showWalletNotInstalled() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        // Verificar nuevamente si MetaMask está disponible
        if (typeof window.ethereum !== 'undefined') {
            connectBtn.textContent = 'Conectar Wallet';
            connectBtn.onclick = connectWallet;
        } else {
            connectBtn.textContent = 'Instalar MetaMask';
            connectBtn.onclick = () => {
                window.open('https://metamask.io/download/', '_blank');
            };
        }
    }
}

async function checkWalletConnection() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            // Verificar si la cuenta cambió desde la última conexión
            const currentAccount = accounts[0].toLowerCase();
            if (userAddress && userAddress.toLowerCase() !== currentAccount) {
                console.warn('⚠️ La cuenta de MetaMask cambió. Reconectando...');
                showAccountChangedWarning(currentAccount);
                // Limpiar estado anterior
                userAddress = null;
                provider = null;
                signer = null;
                icoContract = null;
                usdtContract = null;
            }
            await connectWallet();
        } else if (userAddress) {
            // Si había una cuenta conectada pero ahora no hay ninguna autorizada
            console.warn('⚠️ No hay cuentas autorizadas. Limpiando estado...');
            userAddress = null;
            provider = null;
            signer = null;
            icoContract = null;
            usdtContract = null;
            updateWalletUI();
        }
    } catch (error) {
        console.error('Error checking wallet:', error);
    }
}

async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Por favor instala MetaMask u otra wallet compatible');
            return;
        }

        // Primero verificar cuentas autorizadas sin mostrar popup
        let accounts = await window.ethereum.request({ method: 'eth_accounts' });

        // Si no hay cuentas autorizadas, solicitar conexión (esto mostrará el popup)
        if (accounts.length === 0) {
            accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
        }

        if (accounts.length === 0) {
            // Usuario canceló o no hay cuentas
            if (userAddress) {
                // Si había una cuenta conectada pero ahora no hay ninguna, limpiar estado
                console.warn('⚠️ No hay cuentas autorizadas. Limpiando estado...');
                userAddress = null;
                provider = null;
                signer = null;
                icoContract = null;
                usdtContract = null;
                updateWalletUI();
            }
            return;
        }

        const newAddress = accounts[0];

        // Verificar si la dirección cambió
        if (userAddress && userAddress.toLowerCase() !== newAddress.toLowerCase()) {
            console.warn('⚠️ Cambio de cuenta detectado en connectWallet:', {
                anterior: userAddress,
                nueva: newAddress
            });
            showAccountChangedWarning(newAddress);
            // Limpiar estado anterior
            provider = null;
            signer = null;
            icoContract = null;
            usdtContract = null;
        }

        userAddress = newAddress;
        lastKnownMetaMaskAccount = newAddress.toLowerCase();

        // Verificar red y actualizar configuración
        await checkNetwork();

        // Asegurarse de que currentNetworkConfig esté actualizado
        currentNetworkConfig = await getCurrentNetworkConfig();
        console.log('🌐 Configuración de red actualizada:', currentNetworkConfig.networkName);
        console.log('🌐 Dirección ICO:', currentNetworkConfig.icoAddress);

        // Configurar provider y signer (siempre crear nuevos para la cuenta actual)
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Verificar que el signer corresponde a la cuenta correcta
        const signerAddress = await signer.getAddress();
        if (signerAddress.toLowerCase() !== newAddress.toLowerCase()) {
            const errorMsg = `⚠️ Error de sincronización de cuenta\n\n` +
                `La dirección del signer (${signerAddress.substring(0, 6)}...${signerAddress.substring(38)}) ` +
                `no coincide con la cuenta conectada (${newAddress.substring(0, 6)}...${newAddress.substring(38)}).\n\n` +
                `Por favor, desconecta y vuelve a conectar tu wallet.`;
            throw new Error(errorMsg);
        }

        // VERIFICACIÓN ADICIONAL: Intentar hacer una operación de solo lectura para confirmar que el signer funciona
        // Esto ayuda a detectar si el signer ya no es válido (por ejemplo, si cambiaste de cuenta)
        try {
            await signer.getTransactionCount();
            console.log('✅ Verificación de signer exitosa');
        } catch (e) {
            console.warn('⚠️ El signer no puede hacer operaciones:', e.message);
            throw new Error('El signer no es válido. Por favor reconecta tu wallet.');
        }

        console.log('✅ Wallet conectada correctamente:', {
            address: newAddress,
            signerAddress: signerAddress,
            match: signerAddress.toLowerCase() === newAddress.toLowerCase()
        });

        // Inicializar contratos
        await initContracts();

        // Actualizar UI
        updateWalletUI();
        showCryptoBuySection();

        // Verificar si el token ya está listado y agregarlo automáticamente si no lo está
        await checkAndAddTokenIfNeeded();

        // Verificar aprobación USDT después de conectar
        if (usdtContract && userAddress) {
            await updateUSDTApprovalUI();
        }

        // Verificar si los contratos se inicializaron correctamente
        if (!icoContract) {
            console.warn('Contratos no inicializados - verificar direcciones en', currentNetworkConfig.networkName);
        }

    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error al conectar wallet: ' + error.message);
    }
}

async function checkNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    // Actualizar configuración de red actual
    currentNetworkConfig = await getCurrentNetworkConfig();

    // Verificar si está en una red soportada (Testnet o Mainnet)
    const isTestnet = chainId === CONFIG.BSC_TESTNET_CHAIN_ID;
    const isMainnet = chainId === CONFIG.BSC_MAINNET_CHAIN_ID;

    if (!isTestnet && !isMainnet) {
        // Si no está en una red soportada, usar preferencia de URL (por defecto: mainnet)
        const preferredNetwork = getPreferredNetworkFromURL();
        const useMainnet = preferredNetwork === 'mainnet';

        console.log('⚠️ No estás conectado a BSC Testnet ni Mainnet.');
        console.log('🌐 Usando preferencia de URL:', preferredNetwork);

        // Si la URL no especifica, intentar cambiar a Mainnet automáticamente
        if (useMainnet) {
            console.log('🔄 Intentando cambiar a BSC Mainnet...');
        } else {
            console.log('🔄 Intentando cambiar a BSC Testnet...');
        }

        const targetChainId = useMainnet ? CONFIG.BSC_MAINNET_CHAIN_ID : CONFIG.BSC_TESTNET_CHAIN_ID;
        const targetRpc = useMainnet ? CONFIG.BSC_MAINNET_RPC : CONFIG.BSC_TESTNET_RPC;
        const targetNetworkName = useMainnet ? 'BSC Mainnet' : 'BSC Testnet';
        const targetExplorer = useMainnet ? 'https://bscscan.com' : 'https://testnet.bscscan.com';

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
            });
            // Actualizar configuración después de cambiar
            currentNetworkConfig = await getCurrentNetworkConfig();
        } catch (switchError) {
            // Si la red no existe, agregarla
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: targetChainId,
                        chainName: targetNetworkName,
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        },
                        rpcUrls: [targetRpc],
                        blockExplorerUrls: [targetExplorer]
                    }],
                });
                // Actualizar configuración después de agregar
                currentNetworkConfig = await getCurrentNetworkConfig();
            } else {
                throw switchError;
            }
        }
    } else {
        // Está en una red soportada, pero verificar si coincide con la preferencia de URL
        const preferredNetwork = getPreferredNetworkFromURL();

        // Si está en Testnet pero la URL prefiere Mainnet (por defecto), intentar cambiar
        if (isTestnet && preferredNetwork === 'mainnet') {
            console.log('⚠️ MetaMask está en Testnet pero la preferencia es Mainnet.');
            console.log('🔄 Intentando cambiar a BSC Mainnet...');

            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CONFIG.BSC_MAINNET_CHAIN_ID }],
                });
                // Actualizar configuración después de cambiar
                currentNetworkConfig = await getCurrentNetworkConfig();
                console.log('✅ Cambiado a Mainnet exitosamente');
            } catch (switchError) {
                // Si la red no existe, agregarla
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: CONFIG.BSC_MAINNET_CHAIN_ID,
                            chainName: 'BSC Mainnet',
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18
                            },
                            rpcUrls: [CONFIG.BSC_MAINNET_RPC],
                            blockExplorerUrls: ['https://bscscan.com']
                        }],
                    });
                    currentNetworkConfig = await getCurrentNetworkConfig();
                    console.log('✅ Mainnet agregado y cambiado exitosamente');
                } else {
                    console.warn('⚠️ No se pudo cambiar a Mainnet. Usando Testnet actual.');
                    currentNetworkConfig = await getCurrentNetworkConfig();
                }
            }
        } else if (isMainnet && preferredNetwork === 'testnet') {
            // Si está en Mainnet pero la URL prefiere Testnet, usar Testnet
            console.log('⚠️ MetaMask está en Mainnet pero la URL solicita Testnet.');
            console.log('🔄 Intentando cambiar a BSC Testnet...');

            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CONFIG.BSC_TESTNET_CHAIN_ID }],
                });
                currentNetworkConfig = await getCurrentNetworkConfig();
                console.log('✅ Cambiado a Testnet exitosamente');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: CONFIG.BSC_TESTNET_CHAIN_ID,
                            chainName: 'BSC Testnet',
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18
                            },
                            rpcUrls: [CONFIG.BSC_TESTNET_RPC],
                            blockExplorerUrls: ['https://testnet.bscscan.com']
                        }],
                    });
                    currentNetworkConfig = await getCurrentNetworkConfig();
                    console.log('✅ Testnet agregado y cambiado exitosamente');
                } else {
                    console.warn('⚠️ No se pudo cambiar a Testnet. Usando Mainnet actual.');
                    currentNetworkConfig = await getCurrentNetworkConfig();
                }
            }
        } else {
            // La red coincide con la preferencia, usar la actual
            currentNetworkConfig = await getCurrentNetworkConfig();
            console.log('✅ Conectado a:', currentNetworkConfig.networkName);
            console.log('📍 Dirección ICO:', currentNetworkConfig.icoAddress);
            console.log('📍 Dirección Token:', currentNetworkConfig.tokenAddress);
            console.log('📍 Dirección USDT:', currentNetworkConfig.usdtAddress);
        }
    }
}

async function initContracts() {
    if (!signer) {
        console.warn('No signer available for contract initialization');
        return;
    }

    // Actualizar configuración de red antes de inicializar contratos
    currentNetworkConfig = await getCurrentNetworkConfig();

    // También actualizar el contrato de solo lectura si la red cambió
    await initReadOnlyContracts();

    console.log('🔧 ===== INICIALIZANDO CONTRATOS =====');
    console.log('🌐 Red:', currentNetworkConfig.networkName);
    console.log('📍 Chain ID:', currentNetworkConfig.chainId);
    console.log('📍 ICO Address:', currentNetworkConfig.icoAddress);
    console.log('📍 Token Address:', currentNetworkConfig.tokenAddress);
    console.log('📍 USDT Address:', currentNetworkConfig.usdtAddress);

    // Verificar si las direcciones están configuradas
    if (!currentNetworkConfig.icoAddress || currentNetworkConfig.icoAddress === '0x0000000000000000000000000000000000000000') {
        console.error('❌ ICO_ADDRESS no está configurado para', currentNetworkConfig.networkName);
        alert(`⚠️ Los contratos no están desplegados aún en ${currentNetworkConfig.networkName}.\n\nPor favor, despliega los contratos primero o configura las direcciones en js/ico.js`);
        return;
    }

    try {
        icoContract = new ethers.Contract(currentNetworkConfig.icoAddress, ICO_ABI, signer);
        console.log('✅ ICO Contract inicializado:', currentNetworkConfig.icoAddress, `(${currentNetworkConfig.networkName})`);

        if (currentNetworkConfig.usdtAddress && currentNetworkConfig.usdtAddress !== '') {
            usdtContract = new ethers.Contract(currentNetworkConfig.usdtAddress, ERC20_ABI, signer);
            console.log('✅ USDT Contract inicializado:', currentNetworkConfig.usdtAddress, `(${currentNetworkConfig.networkName})`);
        }

        console.log('🔧 ===== CONTRATOS INICIALIZADOS =====');

        // Recalcular precios si hay valores ingresados
        const bnbUfInput = document.getElementById('bnb-uf-amount');
        if (bnbUfInput && bnbUfInput.value) {
            calculateBNBPrice(bnbUfInput.value);
        }
        const usdtUfInput = document.getElementById('usdt-uf-amount');
        if (usdtUfInput && usdtUfInput.value) {
            calculateUSDTPrice(usdtUfInput.value);
        }

        // Verificar y actualizar estado de aprobación USDT
        if (usdtContract && userAddress) {
            await updateUSDTApprovalUI();
        }
    } catch (error) {
        console.error('Error initializing contracts:', error);
        alert('Error al inicializar contratos: ' + error.message);
    }
}

function updateWalletUI() {
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const walletNetwork = document.getElementById('wallet-network');
    const connectBtn = document.getElementById('connect-wallet-btn');
    const addTokenBtn = document.getElementById('add-token-btn');
    const contractStatus = document.getElementById('contract-status');
    const contractStatusText = document.getElementById('contract-status-text');

    // Si no hay cuenta conectada, limpiar UI
    if (!userAddress) {
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }
        if (connectBtn) {
            connectBtn.textContent = 'Conectar Wallet';
            connectBtn.disabled = false;
        }
        if (addTokenBtn) {
            addTokenBtn.style.display = 'none';
        }
        // Ocultar sección de compra
        const cryptoSection = document.getElementById('crypto-buy-section');
        if (cryptoSection) {
            cryptoSection.style.display = 'none';
        }
        return;
    }

    if (walletInfo && walletAddress) {
        walletInfo.style.display = 'block';
        walletAddress.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        if (walletNetwork) {
            walletNetwork.textContent = currentNetworkConfig.networkName;
        }

        // Actualizar estado de contratos
        if (contractStatus && contractStatusText) {
            const networkName = currentNetworkConfig.networkName;
            if (!currentNetworkConfig.icoAddress || currentNetworkConfig.icoAddress === '0x0000000000000000000000000000000000000000') {
                contractStatus.style.background = 'hsl(var(--destructive) / 0.2)';
                contractStatus.style.color = 'hsl(var(--destructive))';
                contractStatusText.innerHTML = `⚠️ <strong>Contratos no desplegados en ${networkName}:</strong> Configura direcciones en js/ico.js`;
            } else if (!icoContract) {
                contractStatus.style.background = 'hsl(var(--destructive) / 0.2)';
                contractStatus.style.color = 'hsl(var(--destructive))';
                contractStatusText.innerHTML = '⚠️ <strong>Error:</strong> No se pudieron inicializar los contratos';
            } else {
                contractStatus.style.background = 'hsl(var(--primary) / 0.2)';
                contractStatus.style.color = 'hsl(var(--primary))';
                contractStatusText.innerHTML = '✅ <strong>Listo:</strong> Contratos inicializados correctamente';
            }
        }
    }

    if (connectBtn) {
        connectBtn.textContent = 'Wallet Conectada';
        connectBtn.disabled = true;
    }

    // Mostrar botón de agregar token cuando la wallet esté conectada
    if (addTokenBtn && currentNetworkConfig.tokenAddress && userAddress) {
        addTokenBtn.style.display = 'inline-block';
        // Verificar si el token ya está listado y actualizar el botón
        isTokenAlreadyListed().then(alreadyListed => {
            if (alreadyListed) {
                addTokenBtn.textContent = '✅ Token Listado';
                addTokenBtn.disabled = true;
            } else {
                addTokenBtn.textContent = 'Listar UF Token';
                addTokenBtn.disabled = false;
            }
        }).catch(() => {
            // Si hay error, mostrar botón normal
            addTokenBtn.textContent = 'Listar UF Token';
            addTokenBtn.disabled = false;
        });
    } else if (addTokenBtn) {
        addTokenBtn.style.display = 'none';
    }
}

function showCryptoBuySection() {
    const cryptoSection = document.getElementById('crypto-buy-section');
    if (cryptoSection) {
        cryptoSection.style.display = 'block';
    }
}

// Función para verificar si el token ya está listado en MetaMask
// Verifica el balance del token usando el provider
async function isTokenAlreadyListed() {
    if (!userAddress || !currentNetworkConfig.tokenAddress) {
        return false;
    }

    try {
        // Usar el provider para leer el balance del token directamente
        // Si podemos leer el balance, el token está disponible en la red
        const provider = signer ? signer.provider : readOnlyProvider;
        if (!provider) {
            return false;
        }

        // ABI mínimo para balanceOf
        const tokenABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const tokenContract = new ethers.Contract(
            currentNetworkConfig.tokenAddress,
            tokenABI,
            provider
        );

        // Intentar leer el balance - si funciona, el token está disponible
        const balance = await tokenContract.balanceOf(userAddress);
        // Si podemos leer el balance sin error, el token está disponible
        // (aunque el balance sea 0, el token está reconocido en la red)
        return true;
    } catch (error) {
        // Si hay error, asumimos que no está listado o no está disponible
        console.log('⚠️ No se pudo verificar si el token está listado:', error.message);
        return false;
    }
}

// Función para verificar y agregar el token solo si no está listado
async function checkAndAddTokenIfNeeded() {
    // Solo verificar si la wallet está conectada
    if (!userAddress || typeof window.ethereum === 'undefined') {
        return;
    }

    // Verificar si el token ya está listado
    const alreadyListed = await isTokenAlreadyListed();

    if (alreadyListed) {
        console.log('✅ Token UF ya está listado en MetaMask');
        // Actualizar botón para indicar que ya está listado
        const addTokenBtn = document.getElementById('add-token-btn');
        if (addTokenBtn) {
            addTokenBtn.textContent = '✅ Token Listado';
            addTokenBtn.disabled = true;
        }
        return;
    }

    // Si no está listado, intentar agregarlo automáticamente (sin mostrar popup si el usuario cancela)
    console.log('🔄 Token UF no está listado, intentando agregar automáticamente...');
    await addTokenToMetaMask(true); // true = modo silencioso (no mostrar alertas)
}

// Función para agregar el token UF a MetaMask
async function addTokenToMetaMask(silent = false) {
    if (typeof window.ethereum === 'undefined') {
        if (!silent) {
            console.warn('MetaMask no está disponible');
        }
        return false;
    }

    // Verificar que tengamos la dirección del token
    if (!currentNetworkConfig.tokenAddress || currentNetworkConfig.tokenAddress === '0x0000000000000000000000000000000000000000') {
        if (!silent) {
            console.warn('⚠️ Dirección del token no configurada');
        }
        return false;
    }

    // Verificar que la wallet esté conectada
    if (!userAddress) {
        if (!silent) {
            console.warn('⚠️ Wallet no conectada');
        }
        return false;
    }

    try {
        // Información del token UF
        const tokenAddress = currentNetworkConfig.tokenAddress;
        const tokenSymbol = 'UF';
        const tokenName = 'UF ICO_2026'; // Nombre completo del token
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
            // Actualizar texto del botón
            const addTokenBtn = document.getElementById('add-token-btn');
            if (addTokenBtn) {
                addTokenBtn.textContent = '✅ Token Listado';
                addTokenBtn.disabled = true;
            }
            return true;
        } else {
            if (!silent) {
                console.log('⚠️ Usuario canceló la adición del token');
            }
            return false;
        }
    } catch (error) {
        if (!silent) {
            console.error('❌ Error al agregar token a MetaMask:', error);
            alert('Error al agregar token: ' + (error.message || 'Error desconocido'));
        } else {
            console.log('⚠️ No se pudo agregar el token automáticamente (modo silencioso)');
        }
        return false;
    }
}

function setupEventListeners() {
    // Conectar wallet
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }

    // Agregar token a MetaMask
    const addTokenBtn = document.getElementById('add-token-btn');
    if (addTokenBtn) {
        addTokenBtn.addEventListener('click', async () => {
            // Verificar que la wallet esté conectada
            if (!userAddress) {
                alert('Por favor conecta tu wallet primero');
                return;
            }

            addTokenBtn.disabled = true;
            addTokenBtn.textContent = 'Agregando...';
            const success = await addTokenToMetaMask(false); // false = mostrar alertas
            if (success) {
                addTokenBtn.textContent = '✅ Token Listado';
                addTokenBtn.disabled = true;
            } else {
                addTokenBtn.disabled = false;
                addTokenBtn.textContent = 'Listar UF Token';
            }
        });
    }

    // Comprar con BNB
    const buyBnbBtn = document.getElementById('buy-bnb-btn');
    const bnbUfAmountInput = document.getElementById('bnb-uf-amount');

    if (bnbUfAmountInput) {
        bnbUfAmountInput.addEventListener('input', function () {
            calculateBNBPrice(this.value);
        });
    }

    // Cargar precios UF y BNB al inicio para cálculos
    Promise.all([
        loadUFPrice(),
        loadBNBPrice()
    ]).then(() => {
        console.log('✅ Precios cargados:');
        console.log('  - UF:', currentUFPrice, 'CLP');
        console.log('  - BNB:', currentBNBPriceCLP, 'CLP');
        if (currentUFPrice && currentBNBPriceCLP) {
            const calculatedPrice = currentUFPrice / currentBNBPriceCLP;
            console.log('  - Precio calculado: 1 UF =', calculatedPrice.toFixed(6), 'BNB');
        }
        // Actualizar cálculos si hay valores ingresados
        if (bnbUfAmountInput && bnbUfAmountInput.value) {
            calculateBNBPrice(bnbUfAmountInput.value);
        }
        const usdtUfAmountInput = document.getElementById('usdt-uf-amount');
        if (usdtUfAmountInput && usdtUfAmountInput.value) {
            calculateUSDTPrice(usdtUfAmountInput.value);
        }
    }).catch(error => {
        console.error('❌ Error cargando precios:', error);
    });

    if (buyBnbBtn) {
        buyBnbBtn.addEventListener('click', buyWithBNB);
    }

    // Comprar con USDT
    const buyUsdtBtn = document.getElementById('buy-usdt-btn');
    const usdtUfAmountInput = document.getElementById('usdt-uf-amount');
    const approveUsdtBtn = document.getElementById('approve-usdt-btn');

    if (usdtUfAmountInput) {
        usdtUfAmountInput.addEventListener('input', function () {
            calculateUSDTPrice(this.value);
        });
    }

    if (approveUsdtBtn) {
        approveUsdtBtn.addEventListener('click', approveUSDT);
    }

    if (buyUsdtBtn) {
        buyUsdtBtn.addEventListener('click', buyWithUSDT);
    }

    // Formulario fiat
    const fiatAmountInput = document.getElementById('fiat-amount');

    if (fiatAmountInput) {
        fiatAmountInput.addEventListener('input', function () {
            calculateFiatTotal(this.value);
            // PayPal está en desarrollo, no actualizar botón
        });
    }

    // PayPal está en desarrollo - mostrar mensaje de "próximamente"
    // (Ya está manejado en el HTML, pero por si acaso)
    const container = document.getElementById('paypal-button-container');
    if (container) {
        // El HTML ya tiene el mensaje de "próximamente", así que no hacer nada aquí
        console.log('PayPal: Próximamente (en desarrollo)');
    }
}

// Calcular precio en BNB basado en cantidad de UF
async function calculateBNBPrice(ufAmount) {
    const priceInput = document.getElementById('bnb-price');
    if (!priceInput) return;

    if (!ufAmount || parseFloat(ufAmount) <= 0) {
        priceInput.value = '';
        return;
    }

    try {
        let pricePerUFInBNB = null;

        // PRIORIDAD 1: Calcular precio dinámicamente basado en precio real de UF (MÁS PRECISO)
        // Cargar precios si no están disponibles
        if (!currentUFPrice) {
            await loadUFPrice();
        }
        if (!currentBNBPriceCLP) {
            await loadBNBPrice();
        }

        // Calcular precio dinámicamente: UF_CLP / BNB_CLP (precio real actualizado)
        // Usar el precio real de la API, sin forzar mínimo (la validación del 5% en el contrato protege)
        if (currentUFPrice && currentBNBPriceCLP) {
            // Usar el precio real de la API directamente
            // La validación del 5% en el contrato previene actualizaciones que bajen más del 5%
            const ufPriceToUse = currentUFPrice;
            // Precio de 1 UF en BNB = Precio UF en CLP / Precio BNB en CLP
            pricePerUFInBNB = ufPriceToUse / currentBNBPriceCLP;
            console.log('Precio calculado dinámicamente desde API:', pricePerUFInBNB, 'BNB por UF');
            console.log('  - Precio UF oficial:', ufPriceToUse, 'CLP');
            console.log('  - Precio BNB:', currentBNBPriceCLP, 'CLP');
        }

        // PRIORIDAD 2: Obtener precio del contrato (fallback si no hay precios dinámicos)
        if (!pricePerUFInBNB && icoContract) {
            try {
                const contractPrice = await icoContract.priceInBNB();
                // El precio del contrato está en wei, convertir a BNB
                pricePerUFInBNB = parseFloat(ethers.utils.formatEther(contractPrice));
                console.log('Precio desde contrato (fallback):', pricePerUFInBNB, 'BNB por UF');
            } catch (contractError) {
                console.warn('No se pudo obtener precio del contrato:', contractError);
            }
        }

        // PRIORIDAD 3: Usar precio por defecto de CONFIG
        if (!pricePerUFInBNB) {
            pricePerUFInBNB = parseFloat(CONFIG.PRICE_BNB);
            console.log('Usando precio por defecto de CONFIG:', pricePerUFInBNB, 'BNB por UF');
        }

        if (pricePerUFInBNB) {
            const totalBNB = parseFloat(ufAmount) * pricePerUFInBNB;
            priceInput.value = `${totalBNB.toFixed(6)} BNB`;

            // Mostrar también el precio por UF
            const priceDisplay = document.getElementById('bnb-price-per-uf');
            if (priceDisplay) {
                priceDisplay.textContent = `1 UF = ${pricePerUFInBNB.toFixed(6)} BNB`;
            }
        } else {
            priceInput.value = 'Cargando precios...';
        }
    } catch (error) {
        console.error('Error calculando precio BNB:', error);
        priceInput.value = 'Error al calcular';
    }
}

// Calcular precio en USDT basado en cantidad de UF
async function calculateUSDTPrice(ufAmount) {
    const priceInput = document.getElementById('usdt-price');
    if (!priceInput) return;

    if (!ufAmount || parseFloat(ufAmount) <= 0) {
        priceInput.value = '';
        return;
    }

    try {
        // Cargar precio UF si no está disponible
        if (!currentUFPrice) {
            await loadUFPrice();
        }

        // Calcular precio dinámicamente: 1 UF = 1 UF en CLP, convertir a USDT
        // Asumiendo 1 USDT ≈ 900 CLP (aproximado, se puede mejorar con API)
        const usdtPriceCLP = 900; // Precio aproximado de 1 USDT en CLP

        if (currentUFPrice) {
            // Usar el precio real de la API directamente
            // La validación del 5% en el contrato previene actualizaciones que bajen más del 5%
            const ufPriceToUse = currentUFPrice;
            // Precio de 1 UF en USDT = Precio UF en CLP / Precio USDT en CLP
            const pricePerUFInUSDT = ufPriceToUse / usdtPriceCLP;
            const totalUSDT = parseFloat(ufAmount) * pricePerUFInUSDT;
            priceInput.value = `${totalUSDT.toFixed(2)} USDT`;

            // Mostrar también el precio por UF
            const priceDisplay = document.getElementById('usdt-price-per-uf');
            if (priceDisplay) {
                priceDisplay.textContent = `1 UF = ${pricePerUFInUSDT.toFixed(2)} USDT`;
            }
        } else {
            priceInput.value = 'Cargando precios...';
        }
    } catch (error) {
        console.error('Error calculando precio USDT:', error);
        priceInput.value = 'Error al calcular';
    }
}

// Cargar precio de BNB en CLP
async function loadBNBPrice() {
    try {
        // Opción 1: Intentar obtener desde CoinGecko API (gratuita)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=clp');

        if (response.ok) {
            const data = await response.json();
            if (data.binancecoin && data.binancecoin.clp) {
                currentBNBPriceCLP = parseFloat(data.binancecoin.clp);
                console.log('✅ Precio BNB cargado desde CoinGecko:', currentBNBPriceCLP, 'CLP');
                return;
            }
        }

        // Opción 2: Intentar obtener desde CoinMarketCap API (requiere API key, pero hay versión gratuita)
        // Por ahora, usar valor aproximado
        currentBNBPriceCLP = 764779; // Valor aproximado basado en datos recientes
        console.warn('⚠️ Usando precio BNB aproximado:', currentBNBPriceCLP, 'CLP');

    } catch (error) {
        console.error('❌ Error loading BNB price:', error);
        // Usar valor aproximado si falla
        currentBNBPriceCLP = 764779; // Valor aproximado
        console.warn('⚠️ Usando precio BNB aproximado (fallback):', currentBNBPriceCLP, 'CLP');
    }
}

// Cargar precio de la UF desde API
async function loadUFPrice() {
    try {
        // PRIORIDAD 1: Intentar obtener desde API pública gratuita (mindicador.cl)
        // El backend está desactivado por ahora
        console.log('🔄 Intentando obtener precio desde API pública (mindicador.cl)...');
        await loadUFPriceFromPublicAPI();

        // PRIORIDAD 2: Si la API pública falla, usar precio del contrato
        if (!currentUFPrice && icoContract) {
            try {
                console.log('⚠️ API pública no disponible, obteniendo precio del contrato...');
                const contractPriceInBNB = await icoContract.priceInBNB();
                const contractPriceBNB = parseFloat(ethers.utils.formatEther(contractPriceInBNB));

                // Necesitamos convertir el precio del contrato (en BNB) a CLP
                // Para esto necesitamos el precio de BNB en CLP
                if (!currentBNBPriceCLP) {
                    await loadBNBPrice();
                }

                if (currentBNBPriceCLP) {
                    // Precio UF en CLP = Precio en BNB * Precio BNB en CLP
                    currentUFPrice = contractPriceBNB * currentBNBPriceCLP;
                    console.log('✅ Precio UF obtenido desde contrato:', currentUFPrice, 'CLP');
                    console.log('  - Precio contrato:', contractPriceBNB, 'BNB');
                    console.log('  - Precio BNB:', currentBNBPriceCLP, 'CLP');
                    updateUFPriceDisplay();
                } else {
                    // Si no hay precio de BNB, usar precio mínimo como fallback
                    currentUFPrice = MIN_UF_PRICE_CLP;
                    console.warn('⚠️ No se pudo obtener precio de BNB. Usando precio mínimo:', currentUFPrice, 'CLP');
                    updateUFPriceDisplay();
                }
            } catch (contractError) {
                console.error('❌ Error obteniendo precio del contrato:', contractError);
                // Último fallback: precio mínimo
                if (!currentUFPrice) {
                    currentUFPrice = MIN_UF_PRICE_CLP;
                    console.warn('⚠️ Todas las fuentes fallaron. Usando precio mínimo:', currentUFPrice, 'CLP');
                    updateUFPriceDisplay();
                }
            }
        } else if (!currentUFPrice) {
            // Si no hay contrato disponible, usar precio mínimo
            currentUFPrice = MIN_UF_PRICE_CLP;
            console.warn('⚠️ No hay contrato disponible. Usando precio mínimo:', currentUFPrice, 'CLP');
            updateUFPriceDisplay();
        }

    } catch (error) {
        console.error('❌ Error loading UF price:', error);
        // Último fallback: precio mínimo
        if (!currentUFPrice) {
            currentUFPrice = MIN_UF_PRICE_CLP;
            console.warn('⚠️ Error general. Usando precio mínimo:', currentUFPrice, 'CLP');
            updateUFPriceDisplay();
        }
    }
}

// Cargar precio desde API pública (PRIORIDAD 1)
async function loadUFPriceFromPublicAPI() {
    try {
        // API de mindicador.cl (obtiene datos del Banco Central)
        console.log('🔄 Intentando obtener precio desde mindicador.cl...');
        const response = await fetch('https://mindicador.cl/api/uf');

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Respuesta completa de mindicador.cl:', JSON.stringify(data, null, 2));

            // PRIORIDAD 1: Usar data.valor directamente (valor actual más reciente)
            // La API de mindicador.cl devuelve el valor actual en data.valor
            if (data && data.valor !== undefined && data.valor !== null) {
                currentUFPrice = parseFloat(data.valor);
                console.log('✅ PRIORIDAD 1: Precio UF obtenido desde data.valor:', currentUFPrice, 'CLP');
                console.log('📅 Fecha del valor:', data.fecha || 'No disponible');
                updateUFPriceDisplay();
                return true; // Indica que se obtuvo el precio exitosamente
            } else {
                console.warn('⚠️ data.valor no está disponible:', {
                    valor: data?.valor,
                    tipo: typeof data?.valor,
                    existe: data?.valor !== undefined
                });
            }

            // PRIORIDAD 2: Si no hay data.valor, usar el PRIMER elemento de la serie (más reciente)
            // La serie está ordenada con el valor más reciente primero
            if (data && data.serie && data.serie.length > 0) {
                // Obtener el PRIMER valor (más reciente) de la serie
                const firstValue = data.serie[0];
                console.log('📅 PRIORIDAD 2: Primer valor de la serie (más reciente):', firstValue);
                console.log('📊 Total de elementos en serie:', data.serie.length);
                console.log('📅 Fecha del primer valor:', firstValue?.fecha || 'No disponible');

                if (firstValue && firstValue.valor) {
                    currentUFPrice = parseFloat(firstValue.valor);
                    console.log('✅ Precio UF obtenido desde serie[0] (FALLBACK):', currentUFPrice, 'CLP');
                    console.warn('⚠️ ADVERTENCIA: Se está usando valor de la serie[0], no data.valor. Verificar estructura de la API.');
                    updateUFPriceDisplay();
                    return true; // Indica que se obtuvo el precio exitosamente
                } else {
                    console.warn('⚠️ No se encontró valor en el primer elemento de la serie');

                    // Último recurso: intentar con el último elemento de la serie
                    const lastValue = data.serie[data.serie.length - 1];
                    console.log('📅 Último recurso: Último valor de la serie:', lastValue);
                    if (lastValue && lastValue.valor) {
                        currentUFPrice = parseFloat(lastValue.valor);
                        console.log('✅ Precio UF obtenido desde serie[último] (ÚLTIMO RECURSO):', currentUFPrice, 'CLP');
                        updateUFPriceDisplay();
                        return true;
                    }
                }
            } else {
                console.warn('⚠️ La respuesta de mindicador.cl no contiene valor ni serie válida');
            }
        } else {
            console.warn('⚠️ mindicador.cl respondió con error:', response.status, response.statusText);
        }

        return false; // Indica que no se pudo obtener el precio

    } catch (error) {
        console.error('❌ Error al conectar con mindicador.cl:', error);
        return false; // Indica que hubo un error
    }
}

// Función helper para formatear números en formato chileno estándar
// Punto decimal, sin separador de miles
function formatPriceChilean(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }
    return parseFloat(value).toFixed(decimals);
}

// Actualizar display del precio de la UF
function updateUFPriceDisplay() {
    const priceDisplay = document.getElementById('uf-price-display');
    if (!priceDisplay) return;

    if (currentUFPrice) {
        // Mostrar precio actual de la UF con 2 decimales
        // Formato estándar chileno: punto decimal, sin separador de miles
        // Ejemplo: 1 UF = $39643.59 CLP
        const formattedPrice = formatPriceChilean(currentUFPrice, 2);
        priceDisplay.textContent = `1 UF = $${formattedPrice} CLP`;
        console.log('✅ Display actualizado con precio oficial:', currentUFPrice, 'CLP');
    } else {
        priceDisplay.textContent = 'Cargando precio...';
    }
}

function calculateFiatTotal(ufAmount) {
    if (!ufAmount || ufAmount <= 0) {
        document.getElementById('fiat-total').value = '';
        return;
    }

    // El precio de 1 UF Token = 1 UF real (precio obtenido desde API)
    if (!currentUFPrice) {
        // Si aún no se ha cargado el precio, mostrar mensaje
        document.getElementById('fiat-total').value = 'Cargando precio...';
        loadUFPrice(); // Intentar cargar nuevamente
        return;
    }

    // 1 UF Token = 1 UF real = currentUFPrice CLP
    const total = parseFloat(ufAmount) * currentUFPrice;
    // Formato estándar chileno: punto decimal, sin separador de miles
    const formattedTotal = formatPriceChilean(total, 2);
    document.getElementById('fiat-total').value = `$${formattedTotal} CLP`;
}

// Configuración de PayPal (actualizar con tus credenciales)
const PAYPAL_CONFIG = {
    // Obtener Client ID desde https://developer.paypal.com
    CLIENT_ID: '', // Tu Client ID de PayPal (actualizar en index.html también)
    ENVIRONMENT: 'sandbox', // 'sandbox' para pruebas, 'production' para producción
    CURRENCY: 'CLP', // Moneda chilena
    LOCALE: 'es_CL' // Locale para Chile
};

async function buyWithBNB() {
    // Verificar que la wallet esté conectada
    if (!signer || !userAddress) {
        alert('Por favor conecta tu wallet primero haciendo clic en "Conectar Wallet"');
        return;
    }

    // Verificar que los contratos estén inicializados
    if (!icoContract) {
        const networkName = currentNetworkConfig.networkName;
        const deployCommand = networkName === 'BSC Mainnet' ? 'npm run deploy:mainnet' : 'npm run deploy:testnet';
        if (!currentNetworkConfig.icoAddress || currentNetworkConfig.icoAddress === '0x0000000000000000000000000000000000000000') {
            alert(`⚠️ Los contratos no están desplegados aún en ${networkName}.\n\nPor favor:\n1. Despliega los contratos con: ${deployCommand}\n2. Actualiza las direcciones en js/ico.js`);
        } else {
            alert('Error: Los contratos no se pudieron inicializar. Por favor recarga la página e intenta nuevamente.');
        }
        return;
    }

    const ufAmount = document.getElementById('bnb-uf-amount').value;
    if (!ufAmount || parseFloat(ufAmount) <= 0) {
        alert('Por favor ingresa una cantidad válida de UF a comprar');
        return;
    }

    try {
        const buyBtn = document.getElementById('buy-bnb-btn');
        buyBtn.disabled = true;
        buyBtn.textContent = 'Procesando...';

        // Cargar precios si no están disponibles
        if (!currentUFPrice) {
            await loadUFPrice();
        }
        if (!currentBNBPriceCLP) {
            await loadBNBPrice();
        }

        if (!currentUFPrice || !currentBNBPriceCLP) {
            throw new Error('No se pudieron cargar los precios. Por favor recarga la página.');
        }

        // Obtener precio actual del contrato
        let contractPriceInBNB = null;
        if (icoContract) {
            try {
                const contractPrice = await icoContract.priceInBNB();
                contractPriceInBNB = parseFloat(ethers.utils.formatEther(contractPrice));
                console.log('Precio actual del contrato:', contractPriceInBNB, 'BNB por UF');
            } catch (contractError) {
                console.warn('No se pudo obtener precio del contrato:', contractError);
            }
        }

        // Calcular precio dinámicamente basado en precio real de UF desde API
        let calculatedPriceInBNB = null;
        let newPriceToUpdate = null;

        // PRIORIDAD 1: Calcular basado en precio real de UF desde API
        // Usar el precio real de la API, sin forzar mínimo (la validación del 5% en el contrato protege)
        if (currentUFPrice && currentBNBPriceCLP) {
            // Usar el precio real de la API directamente
            // La validación del 5% en el contrato previene actualizaciones que bajen más del 5%
            const ufPriceToUse = currentUFPrice;
            calculatedPriceInBNB = ufPriceToUse / currentBNBPriceCLP;
            console.log('Precio calculado desde API:', calculatedPriceInBNB, 'BNB por UF');
            console.log('  - Precio UF oficial:', ufPriceToUse, 'CLP');
            console.log('  - Precio BNB:', currentBNBPriceCLP, 'CLP');
        }

        // PRIORIDAD 2: Si no hay API, usar precio del contrato
        if (!calculatedPriceInBNB && contractPriceInBNB) {
            calculatedPriceInBNB = contractPriceInBNB;
            console.log('Usando precio del contrato (API no disponible):', calculatedPriceInBNB, 'BNB por UF');
        }

        // PRIORIDAD 3: Usar precio de CONFIG (último fallback)
        if (!calculatedPriceInBNB) {
            calculatedPriceInBNB = parseFloat(CONFIG.PRICE_BNB);
            console.log('Usando precio por defecto de CONFIG:', calculatedPriceInBNB, 'BNB por UF');
        }

        if (!calculatedPriceInBNB || calculatedPriceInBNB <= 0) {
            throw new Error('No se pudo determinar el precio. Por favor recarga la página.');
        }

        // Determinar si se debe actualizar el precio en el contrato
        // Solo actualizar si:
        // 1. Se obtuvo precio desde API (currentUFPrice existe)
        // 2. El precio calculado es diferente al precio del contrato
        // 3. El precio calculado no es 5% menor al precio actual del contrato
        if (currentUFPrice && currentBNBPriceCLP && contractPriceInBNB) {
            const priceDifference = Math.abs(calculatedPriceInBNB - contractPriceInBNB);
            const minAllowedPrice = contractPriceInBNB * 0.95; // 95% del precio actual (no puede bajar más del 5%)

            if (calculatedPriceInBNB !== contractPriceInBNB) {
                if (calculatedPriceInBNB >= minAllowedPrice) {
                    // El precio puede actualizarse
                    newPriceToUpdate = ethers.utils.parseEther(calculatedPriceInBNB.toFixed(18));
                    console.log('✅ Precio actualizado: De', contractPriceInBNB, 'a', calculatedPriceInBNB, 'BNB por UF');
                } else {
                    console.warn('⚠️ Precio calculado (' + calculatedPriceInBNB + ' BNB) es más de 5% menor al precio actual del contrato (' + contractPriceInBNB + ' BNB). No se actualizará.');
                    // Usar precio del contrato en lugar del calculado
                    calculatedPriceInBNB = contractPriceInBNB;
                }
            } else {
                console.log('✅ Precios iguales, no se actualiza el contrato');
            }
        }

        // Calcular BNB necesario usando el precio calculado (que puede ser del contrato o actualizado)
        const bnbAmountNeeded = parseFloat(ufAmount) * calculatedPriceInBNB;
        const bnbAmountWei = ethers.utils.parseEther(bnbAmountNeeded.toFixed(18));

        // Verificar balance de BNB del usuario
        const userAddress = await signer.getAddress();
        const balance = await provider.getBalance(userAddress);

        if (balance.lt(bnbAmountWei)) {
            const bnbNeeded = ethers.utils.formatEther(bnbAmountWei);
            throw new Error(`No tienes suficiente BNB en tu wallet. Necesitas ${parseFloat(bnbNeeded).toFixed(6)} BNB`);
        }

        // Verificar que la ICO esté activa
        const icoActive = await icoContract.icoActive();
        if (!icoActive) {
            throw new Error('La ICO no está activa actualmente');
        }

        // Determinar precio a pasar al contrato (0 si no se actualiza, nuevo precio si se actualiza)
        const newPriceParam = newPriceToUpdate || ethers.BigNumber.from(0);

        // Estimar gas antes de enviar la transacción
        let gasEstimate;
        try {
            gasEstimate = await icoContract.estimateGas.buyWithBNB(newPriceParam, {
                value: bnbAmountWei
            });
            console.log('Gas estimado:', gasEstimate.toString());
        } catch (gasError) {
            console.error('Error estimando gas:', gasError);
            // Si falla la estimación, usar un valor por defecto
            gasEstimate = ethers.BigNumber.from('200000');
        }

        // Enviar transacción con gas limit aumentado
        // Pasar el nuevo precio como primer parámetro (0 si no se actualiza)
        const tx = await icoContract.buyWithBNB(newPriceParam, {
            value: bnbAmountWei,
            gasLimit: gasEstimate.mul(120).div(100) // Aumentar 20% sobre la estimación
        });

        console.log('✅ Transacción enviada:', tx.hash);
        buyBtn.textContent = 'Esperando confirmación...';

        // Esperar confirmación con manejo mejorado de errores
        let receipt;
        try {
            receipt = await tx.wait();
            console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber);
            alert(`¡Compra exitosa! Has comprado ${ufAmount} UF tokens.\n\nHash: ${tx.hash}`);
        } catch (waitError) {
            // Si tx.wait() falla pero la transacción tiene hash, puede ser un problema de RPC
            // La transacción puede estar pendiente o confirmada, verificar manualmente
            console.warn('⚠️ Error esperando confirmación, pero transacción enviada:', waitError);

            if (tx.hash) {
                const networkName = currentNetworkConfig.networkName;
                const explorerUrl = networkName === 'BSC Mainnet'
                    ? 'https://bscscan.com'
                    : 'https://testnet.bscscan.com';

                const confirmMessage = `Transacción enviada exitosamente.\n\n` +
                    `Hash: ${tx.hash}\n\n` +
                    `La transacción puede estar pendiente de confirmación.\n` +
                    `Verifica el estado en: ${explorerUrl}/tx/${tx.hash}\n\n` +
                    `Si la transacción se confirma, los tokens aparecerán en tu wallet.`;

                alert(confirmMessage);

                // Abrir BSCScan en nueva pestaña
                window.open(`${explorerUrl}/tx/${tx.hash}`, '_blank');
            } else {
                throw waitError; // Re-lanzar si no hay hash
            }
        }

        // Limpiar formulario solo si la transacción se confirmó
        if (receipt) {
            document.getElementById('bnb-uf-amount').value = '';
            document.getElementById('bnb-price').value = '';
            // Actualizar estadísticas
            updateICOStats();
        }

    } catch (error) {
        console.error('Error buying with BNB:', error);

        let errorMessage = 'Error en la compra';

        if (error.code === 4001) {
            errorMessage = 'Transacción rechazada por el usuario';
        } else if (error.code === -32603) {
            const networkName = currentNetworkConfig.networkName;
            // Si hay transactionHash, la transacción se envió pero falló la verificación
            if (error.transactionHash) {
                const explorerUrl = networkName === 'BSC Mainnet'
                    ? 'https://bscscan.com'
                    : 'https://testnet.bscscan.com';
                errorMessage = `Transacción enviada pero error al verificar.\n\n` +
                    `Hash: ${error.transactionHash}\n\n` +
                    `Verifica el estado en: ${explorerUrl}/tx/${error.transactionHash}\n\n` +
                    `Puede ser un problema temporal del RPC. La transacción puede estar confirmada.`;
            } else {
                errorMessage = `Error interno de RPC (${networkName}). Verifica:\n` +
                    `- Que tengas suficiente BNB\n` +
                    `- Que la ICO esté activa\n` +
                    `- Que la red sea ${networkName}\n` +
                    `- Intenta recargar la página`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.reason) {
            errorMessage = error.reason;
        } else if (error.data && error.data.message) {
            errorMessage = error.data.message;
        }

        alert(errorMessage);
    } finally {
        const buyBtn = document.getElementById('buy-bnb-btn');
        if (buyBtn) {
            buyBtn.disabled = false;
            buyBtn.textContent = 'Comprar con BNB';
        }
    }
}

// Función para verificar y actualizar el estado de los botones de USDT
async function updateUSDTApprovalUI() {
    if (!usdtContract || !userAddress || !currentNetworkConfig.icoAddress) {
        return;
    }

    try {
        const approveBtn = document.getElementById('approve-usdt-btn');
        const buyBtn = document.getElementById('buy-usdt-btn');

        if (!approveBtn || !buyBtn) {
            return;
        }

        // Verificar allowance actual
        const allowance = await usdtContract.allowance(userAddress, currentNetworkConfig.icoAddress);
        const hasApproval = allowance.gt(0);

        console.log('🔍 Verificando aprobación USDT:', {
            allowance: ethers.utils.formatUnits(allowance, 18),
            hasApproval: hasApproval
        });

        if (hasApproval) {
            // Ya hay aprobación, ocultar botón de aprobar y mostrar botón de comprar
            approveBtn.style.display = 'none';
            buyBtn.style.display = 'block';
            buyBtn.disabled = false;
            console.log('✅ USDT ya está aprobado. Botón de comprar habilitado.');
        } else {
            // No hay aprobación, mostrar botón de aprobar y ocultar botón de comprar
            approveBtn.style.display = 'block';
            buyBtn.style.display = 'none';
            console.log('⚠️ USDT no está aprobado. Mostrando botón de aprobar.');
        }
    } catch (error) {
        console.error('Error verificando aprobación USDT:', error);
    }
}

async function approveUSDT() {
    if (!usdtContract || !icoContract) {
        alert('Por favor conecta tu wallet primero');
        return;
    }

    try {
        const approveBtn = document.getElementById('approve-usdt-btn');
        approveBtn.disabled = true;
        approveBtn.textContent = 'Aprobando...';

        // Aprobar cantidad máxima
        const maxAmount = ethers.constants.MaxUint256;
        const tx = await usdtContract.approve(currentNetworkConfig.icoAddress, maxAmount);

        console.log('✅ Transacción de aprobación enviada:', tx.hash);
        approveBtn.textContent = 'Esperando confirmación...';

        // Esperar confirmación con manejo mejorado de errores
        try {
            await tx.wait();
            console.log('✅ Aprobación de USDT confirmada');
            alert('USDT aprobado exitosamente. Ahora puedes comprar tokens.');

            // Actualizar UI después de aprobar
            await updateUSDTApprovalUI();
        } catch (waitError) {
            console.warn('⚠️ Error esperando confirmación de aprobación:', waitError);
            if (tx.hash) {
                // La transacción se envió, verificar si se confirmó
                const networkName = currentNetworkConfig.networkName;
                const explorerUrl = networkName === 'BSC Mainnet'
                    ? 'https://bscscan.com'
                    : 'https://testnet.bscscan.com';

                alert(`Aprobación enviada exitosamente.\n\nHash: ${tx.hash}\n\nVerifica el estado en: ${explorerUrl}/tx/${tx.hash}\n\nSi la transacción se confirma, el botón de comprar aparecerá automáticamente.`);

                // Abrir BSCScan en nueva pestaña
                window.open(`${explorerUrl}/tx/${tx.hash}`, '_blank');

                // Intentar verificar la aprobación después de un delay (dar tiempo a que se confirme)
                setTimeout(async () => {
                    console.log('🔄 Verificando aprobación después de delay...');
                    await updateUSDTApprovalUI();
                }, 5000);
            } else {
                throw waitError;
            }
        }

    } catch (error) {
        console.error('Error approving USDT:', error);
        alert('Error al aprobar USDT: ' + (error.message || 'Error desconocido'));
    } finally {
        const approveBtn = document.getElementById('approve-usdt-btn');
        if (approveBtn) {
            approveBtn.disabled = false;
            approveBtn.textContent = 'Aprobar USDT';
        }
    }
}

async function buyWithUSDT() {
    // Verificar que la wallet esté conectada y sea la correcta
    if (!userAddress || !signer) {
        alert('⚠️ Por favor conecta tu wallet primero');
        await connectWallet();
        return;
    }

    // Verificar que la cuenta actual coincide con la conectada
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
            alert('⚠️ Tu wallet fue desconectada. Por favor reconéctala.');
            userAddress = null;
            provider = null;
            signer = null;
            icoContract = null;
            usdtContract = null;
            updateWalletUI();
            return;
        }

        const currentAccount = accounts[0].toLowerCase();
        if (userAddress.toLowerCase() !== currentAccount) {
            alert('⚠️ La cuenta de MetaMask cambió. Por favor reconecta tu wallet.');
            await connectWallet();
            return;
        }
    } catch (error) {
        console.error('Error verificando cuenta:', error);
        alert('Error al verificar la cuenta. Por favor reconecta tu wallet.');
        return;
    }

    if (!icoContract || !usdtContract) {
        alert('Por favor conecta tu wallet primero');
        return;
    }

    const ufAmount = document.getElementById('usdt-uf-amount').value;
    if (!ufAmount || parseFloat(ufAmount) <= 0) {
        alert('Por favor ingresa una cantidad válida de UF a comprar');
        return;
    }

    try {
        // Cargar precio UF si no está disponible
        if (!currentUFPrice) {
            await loadUFPrice();
        }

        if (!currentUFPrice) {
            throw new Error('No se pudo cargar el precio de la UF. Por favor recarga la página.');
        }

        // Calcular USDT necesario dinámicamente: UF_CLP / USDT_CLP
        // Asumiendo 1 USDT ≈ 900 CLP
        const usdtPriceCLP = 900;
        const pricePerUFInUSDT = currentUFPrice / usdtPriceCLP;
        const usdtAmountNeeded = parseFloat(ufAmount) * pricePerUFInUSDT;
        const usdtAmountWei = ethers.utils.parseUnits(usdtAmountNeeded.toFixed(18), 18);

        // Verificar aprobación
        const allowance = await usdtContract.allowance(userAddress, currentNetworkConfig.icoAddress);

        if (allowance.lt(usdtAmountWei)) {
            const usdtNeeded = ethers.utils.formatUnits(usdtAmountWei, 18);
            alert(`Por favor aprueba USDT primero. Necesitas aprobar al menos ${parseFloat(usdtNeeded).toFixed(2)} USDT`);
            return;
        }

        // Verificar balance de USDT
        const usdtBalance = await usdtContract.balanceOf(userAddress);
        if (usdtBalance.lt(usdtAmountWei)) {
            const usdtNeeded = ethers.utils.formatUnits(usdtAmountWei, 18);
            throw new Error(`No tienes suficiente USDT en tu wallet. Necesitas ${parseFloat(usdtNeeded).toFixed(2)} USDT`);
        }

        const buyBtn = document.getElementById('buy-usdt-btn');
        buyBtn.disabled = true;
        buyBtn.textContent = 'Procesando...';

        const tx = await icoContract.buyWithUSDT(usdtAmountWei);
        console.log('✅ Transacción enviada:', tx.hash);

        // Esperar confirmación con manejo mejorado de errores
        let receipt;
        try {
            receipt = await tx.wait();
            console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber);
            alert(`¡Compra exitosa! Has comprado ${ufAmount} UF tokens.\n\nHash: ${tx.hash}`);
        } catch (waitError) {
            console.warn('⚠️ Error esperando confirmación, pero transacción enviada:', waitError);
            if (tx.hash) {
                const networkName = currentNetworkConfig.networkName;
                const explorerUrl = networkName === 'BSC Mainnet'
                    ? 'https://bscscan.com'
                    : 'https://testnet.bscscan.com';
                alert(`Transacción enviada exitosamente.\n\nHash: ${tx.hash}\n\nVerifica en: ${explorerUrl}/tx/${tx.hash}`);
                window.open(`${explorerUrl}/tx/${tx.hash}`, '_blank');
            } else {
                throw waitError;
            }
        }

        // Limpiar formulario solo si la transacción se confirmó
        if (receipt) {
            document.getElementById('usdt-uf-amount').value = '';
            document.getElementById('usdt-price').value = '';
            // Actualizar estadísticas
            updateICOStats();
        }

    } catch (error) {
        console.error('Error buying with USDT:', error);
        alert('Error en la compra: ' + (error.message || 'Error desconocido'));
    } finally {
        const buyBtn = document.getElementById('buy-usdt-btn');
        buyBtn.disabled = false;
        buyBtn.textContent = 'Comprar con USDT';
    }
}

async function updateICOStats() {
    // PRIORIDAD: Usar contrato de solo lectura primero (no depende de wallet)
    // Solo usar contrato con wallet si no hay contrato de solo lectura disponible
    const contractToUse = readOnlyICOContract || icoContract;

    if (!contractToUse) {
        // Si no hay ningún contrato disponible, intentar inicializar de solo lectura
        const tokensSoldEl = document.getElementById('tokens-sold');
        const bnbRaisedEl = document.getElementById('bnb-raised');
        const usdtRaisedEl = document.getElementById('usdt-raised');
        const icoStatusEl = document.getElementById('ico-status');

        // Mostrar "Cargando..." en todos los recuadros
        if (tokensSoldEl) {
            tokensSoldEl.textContent = 'Cargando...';
        }
        if (bnbRaisedEl) {
            bnbRaisedEl.textContent = 'Cargando...';
        }
        if (usdtRaisedEl) {
            usdtRaisedEl.textContent = 'Cargando...';
        }
        if (icoStatusEl && icoStatusEl.textContent !== 'Cargando...') {
            icoStatusEl.textContent = 'Cargando...';
        }

        // Intentar inicializar contratos de solo lectura si no se han inicializado
        if (!readOnlyICOContract) {
            console.log('🔄 No hay contrato disponible, inicializando contratos de solo lectura...');
            try {
                await initReadOnlyContracts();
                // Si ahora tenemos contrato, intentar actualizar de nuevo
                if (readOnlyICOContract) {
                    console.log('✅ Contrato de solo lectura inicializado, actualizando estadísticas...');
                    return updateICOStats();
                }
            } catch (error) {
                console.error('❌ Error al inicializar contratos de solo lectura:', error);
                if (icoStatusEl) {
                    icoStatusEl.textContent = 'Error de conexión';
                }
            }
        }
        return;
    }

    try {
        // Agregar timeout a la llamada del contrato para evitar esperas infinitas
        const info = await Promise.race([
            contractToUse.getICOInfo(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: La llamada al contrato tardó demasiado')), 8000)
            )
        ]);

        // Tokens usan 4 decimales
        const tokensSold = ethers.utils.formatUnits(info[0], 4);
        const hardCap = ethers.utils.formatUnits(info[1], 4);
        const softCap = ethers.utils.formatUnits(info[2], 4);
        const bnbRaised = ethers.utils.formatEther(info[3]);
        const usdtRaised = ethers.utils.formatUnits(info[4], 18);
        const icoActive = info[5];
        const icoEnded = info[6];
        const tokensRemaining = ethers.utils.formatUnits(info[7], 4);

        // Actualizar UI
        const tokensSoldEl = document.getElementById('tokens-sold');
        const hardCapEl = document.getElementById('hard-cap');
        const bnbRaisedEl = document.getElementById('bnb-raised');
        const usdtRaisedEl = document.getElementById('usdt-raised');
        const icoStatusEl = document.getElementById('ico-status');
        const progressFillEl = document.getElementById('progress-fill');
        const progressPercentageEl = document.getElementById('progress-percentage');

        // Determinar el estado primero
        let statusText = 'Cerrada';
        if (icoActive) {
            statusText = 'Abierta';
        } else if (icoEnded) {
            statusText = 'Finalizada';
        }

        // Verificar si estamos en estado de carga (antes de actualizar el estado)
        const wasLoading = icoStatusEl && icoStatusEl.textContent === 'Cargando...';

        // Verificar si todos los valores son cero (sin datos disponibles aún)
        const tokensValue = parseFloat(tokensSold);
        const bnbValue = parseFloat(bnbRaised);
        const usdtValue = parseFloat(usdtRaised);
        const allZero = tokensValue === 0 && bnbValue === 0 && usdtValue === 0;

        // Si el estado era "Cargando..." o todos los valores son cero, mostrar "Cargando..."
        // Solo mostrar valores cuando estén disponibles (mayor a cero)
        const shouldShowLoading = wasLoading || allZero;

        if (tokensSoldEl) {
            if (shouldShowLoading && tokensValue === 0) {
                tokensSoldEl.textContent = 'Cargando...';
            } else {
                tokensSoldEl.textContent = `${tokensValue.toFixed(2)} UF`;
            }
        }
        if (hardCapEl) {
            hardCapEl.textContent = `${parseFloat(hardCap).toFixed(0)} UF`;
        }
        if (bnbRaisedEl) {
            if (shouldShowLoading && bnbValue === 0) {
                bnbRaisedEl.textContent = 'Cargando...';
            } else {
                bnbRaisedEl.textContent = `${bnbValue.toFixed(4)} BNB`;
            }
        }
        if (usdtRaisedEl) {
            if (shouldShowLoading && usdtValue === 0) {
                usdtRaisedEl.textContent = 'Cargando...';
            } else {
                usdtRaisedEl.textContent = `${usdtValue.toFixed(2)} USDT`;
            }
        }
        if (icoStatusEl) {
            icoStatusEl.textContent = statusText;
        }

        // Actualizar barra de progreso
        const percentage = (parseFloat(tokensSold) / parseFloat(hardCap)) * 100;
        if (progressFillEl) {
            progressFillEl.style.width = `${Math.min(percentage, 100)}%`;
        }
        if (progressPercentageEl) {
            progressPercentageEl.textContent = `${percentage.toFixed(1)}%`;
        }

        console.log('✅ Estadísticas actualizadas:', {
            tokensSold,
            hardCap,
            bnbRaised,
            usdtRaised,
            status: statusText,
            percentage: percentage.toFixed(1) + '%'
        });

    } catch (error) {
        console.error('❌ Error updating ICO stats:', error);

        // Si falla con el contrato de solo lectura, intentar reinicializar
        if (contractToUse === readOnlyICOContract) {
            console.log('🔄 Intentando reinicializar contratos de solo lectura...');
            await initReadOnlyContracts();
        }

        // Mostrar mensaje de error en la UI
        const icoStatusEl = document.getElementById('ico-status');
        if (icoStatusEl) {
            icoStatusEl.textContent = 'Error al cargar';
        }
    }
}

// Inicializar PayPal
function initPayPal() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no está cargado');
        return;
    }

    updatePayPalButton();
}

// Actualizar botón de PayPal
function updatePayPalButton() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    const ufAmount = document.getElementById('fiat-amount').value;
    const totalCLP = document.getElementById('fiat-total').value;

    // Limpiar contenedor
    container.innerHTML = '';

    if (!ufAmount || parseFloat(ufAmount) <= 0) {
        container.innerHTML = '<p style="text-align: center; color: hsl(var(--muted-foreground));">Ingresa una cantidad de UF para habilitar el pago</p>';
        return;
    }

    // Extraer monto numérico de CLP
    const amountCLP = parseInt(totalCLP.replace(/[^0-9]/g, ''));
    if (!amountCLP || amountCLP <= 0) {
        container.innerHTML = '<p style="text-align: center; color: hsl(var(--muted-foreground));">Cantidad inválida</p>';
        return;
    }

    // Renderizar botón de PayPal
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
        },
        createOrder: function (data, actions) {
            // PayPal requiere el monto como string con formato "XX.XX" incluso para CLP
            // Aunque CLP no usa decimales, PayPal lo requiere en este formato
            const amountValue = (amountCLP / 1).toFixed(0); // Sin decimales para CLP

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: amountValue,
                        currency_code: 'CLP'
                    },
                    description: `Compra de ${ufAmount} UF Token - ICO 2026`
                }],
                application_context: {
                    brand_name: 'UF Token ICO 2026',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: window.location.origin + '/ICO_2026/success.html',
                    cancel_url: window.location.origin + '/ICO_2026/failure.html'
                }
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                // Pago exitoso - enviar datos al backend
                handlePayPalSuccess(details, data.orderID);
            });
        },
        onError: function (err) {
            console.error('Error en PayPal:', err);
            alert('Error al procesar el pago con PayPal. Por favor intenta nuevamente.');
        },
        onCancel: function (data) {
            console.log('Pago cancelado por el usuario');
            window.location.href = 'failure.html?reason=cancelled';
        }
    }).render('#paypal-button-container');
}

// Manejar pago exitoso de PayPal
async function handlePayPalSuccess(details, orderID) {
    const email = document.getElementById('fiat-email').value;
    const ufAmount = document.getElementById('fiat-amount').value;
    const walletAddress = document.getElementById('fiat-wallet').value;
    const totalCLP = document.getElementById('fiat-total').value;
    const amountCLP = parseInt(totalCLP.replace(/[^0-9]/g, ''));

    try {
        // Registrar pago en el backend
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/paypal-success`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderID,
                email: email || details.payer.email_address,
                ufAmount: parseFloat(ufAmount),
                amountCLP,
                walletAddress: walletAddress || null,
                payerDetails: {
                    name: details.payer.name,
                    email: details.payer.email_address,
                    payerId: details.payer.payer_id
                },
                paymentDetails: details
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Redirigir a página de éxito
            window.location.href = `success.html?orderId=${data.orderId || orderID}`;
        } else {
            throw new Error('Error al registrar el pago');
        }

    } catch (error) {
        console.error('Error processing PayPal success:', error);
        // Aún así redirigir a éxito ya que PayPal procesó el pago
        window.location.href = `success.html?orderId=${orderID}&warning=true`;
    }
}

// Función para mostrar advertencia de cambio de cuenta
function showAccountChangedWarning(newAddress) {
    let message;

    if (!newAddress) {
        message = `⚠️ Cambio de cuenta detectado\n\n` +
            `La cuenta de MetaMask fue cambiada o desconectada.\n\n` +
            `Por favor, autoriza la nueva cuenta en MetaMask o reconecta tu wallet.`;
    } else {
        message = `⚠️ Cambio de cuenta detectado\n\n` +
            `La aplicación estaba conectada a otra dirección de MetaMask.\n\n` +
            `Nueva dirección: ${newAddress.substring(0, 6)}...${newAddress.substring(38)}\n\n` +
            `Por favor, verifica que esta es la cuenta correcta antes de continuar.`;
    }

    // Solo mostrar alerta si no se ha mostrado recientemente (evitar spam)
    const lastWarning = showAccountChangedWarning.lastWarning || 0;
    const now = Date.now();
    if (now - lastWarning > 3000) { // Solo mostrar cada 3 segundos
        alert(message);
        showAccountChangedWarning.lastWarning = now;
    }

    // Siempre mostrar en consola para debugging
    console.warn('⚠️ ADVERTENCIA: Cambio de cuenta de MetaMask detectado');
    if (newAddress) {
        console.warn('Nueva dirección:', newAddress);
    } else {
        console.warn('Cuenta desconectada o no autorizada');
    }
    if (userAddress) {
        console.warn('Dirección anterior:', userAddress);
    }
}

// Variable para rastrear la última cuenta conocida de MetaMask
let lastKnownMetaMaskAccount = null;
let lastSignerCheck = null;

// Control de validaciones periódicas
let validationPaused = false;
let validationInterval = null;

// Función para obtener la cuenta seleccionada actualmente en MetaMask
// (la que está en primer plano, incluso si no está autorizada)
// IMPORTANTE: Solo usar cuando sea necesario para evitar popups repetidos
async function getCurrentSelectedAccount(silent = false) {
    try {
        // Método 1: Intentar con eth_accounts primero (no muestra popup)
        const authorizedAccounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (authorizedAccounts.length > 0) {
            return authorizedAccounts[0].toLowerCase();
        }

        // Método 2: Solo usar eth_requestAccounts si no está en modo silencioso
        // (esto muestra popup, así que lo evitamos si las validaciones están pausadas)
        if (!silent && !validationPaused) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                if (accounts.length > 0) {
                    return accounts[0].toLowerCase();
                }
            } catch (e) {
                // Si el usuario rechaza, devolver null
                if (e.code === 4001) {
                    console.log('Usuario rechazó la autorización');
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error obteniendo cuenta seleccionada:', error);
        return null;
    }
}

// Función para pausar validaciones periódicas
function pauseValidation() {
    validationPaused = true;
    console.log('⏸️ Validaciones periódicas pausadas');
}

// Función para reanudar validaciones periódicas
function resumeValidation() {
    validationPaused = false;
    console.log('▶️ Validaciones periódicas reanudadas');
}

// Función para configurar listeners de MetaMask
function setupMetaMaskListeners() {
    // Verificar si MetaMask está disponible
    if (typeof window.ethereum === 'undefined') {
        console.log('⚠️ MetaMask no está disponible, reintentando en 1 segundo...');
        // Reintentar después de 1 segundo
        setTimeout(setupMetaMaskListeners, 1000);
        return;
    }

    console.log('✅ Configurando listeners de MetaMask...');

    // Listener para cambios de cuenta - ESTE ES EL MÁS IMPORTANTE
    // MetaMask dispara este evento cuando cambias de cuenta, incluso si la nueva no está autorizada
    window.ethereum.on('accountsChanged', function (accounts) {
        console.log('📱 ===== EVENTO accountsChanged DETECTADO =====');
        console.log('📱 Cuentas:', accounts);
        console.log('📱 Cuenta actual almacenada:', userAddress);
        console.log('📱 Última cuenta conocida:', lastKnownMetaMaskAccount);

        const oldAddress = userAddress;
        const oldLastKnown = lastKnownMetaMaskAccount;

        if (accounts.length === 0) {
            // Usuario desconectó la wallet o cambió a cuenta no autorizada
            console.warn('🔌 ===== CAMBIO DETECTADO: No hay cuentas autorizadas =====');
            console.warn('🔌 Cuenta anterior conectada:', oldAddress);
            console.warn('🔌 Esto significa que el usuario cambió a una cuenta no autorizada o desconectó');

            if (oldAddress) {
                showAccountChangedWarning(null);
            }

            // Limpiar TODO el estado
            userAddress = null;
            lastKnownMetaMaskAccount = null;
            provider = null;
            signer = null;
            icoContract = null;
            usdtContract = null;
            updateWalletUI();

            // Ocultar sección de compra
            const cryptoSection = document.getElementById('crypto-buy-section');
            if (cryptoSection) {
                cryptoSection.style.display = 'none';
            }

            console.log('✅ Estado limpiado completamente');
        } else {
            const newAddress = accounts[0].toLowerCase();
            console.log('📱 Nueva cuenta autorizada:', newAddress);
            lastKnownMetaMaskAccount = newAddress;

            // Verificar si realmente cambió la cuenta
            if (!oldAddress || oldAddress.toLowerCase() !== newAddress) {
                console.warn('⚠️ ===== CAMBIO DE CUENTA DETECTADO =====');
                console.warn('⚠️ Anterior:', oldAddress || 'ninguna');
                console.warn('⚠️ Nueva:', newAddress);
                showAccountChangedWarning(newAddress);

                // Limpiar estado anterior
                userAddress = null;
                provider = null;
                signer = null;
                icoContract = null;
                usdtContract = null;

                // Reconectar con la nueva cuenta
                console.log('🔄 Reconectando con nueva cuenta...');
                connectWallet().catch(error => {
                    console.error('❌ Error al reconectar wallet después de cambio de cuenta:', error);
                    alert('Error al reconectar wallet. Por favor recarga la página.');
                });
            } else {
                console.log('✅ Misma cuenta, no se requiere acción');
            }
        }
        console.log('📱 ===== FIN EVENTO accountsChanged =====');
    });

    // Listener para cambios de red
    window.ethereum.on('chainChanged', async function (chainId) {
        console.log('🌐 ===== CAMBIO DE RED DETECTADO =====');
        console.log('🌐 Nueva Chain ID:', chainId);

        // Actualizar configuración de red inmediatamente
        try {
            currentNetworkConfig = await getCurrentNetworkConfig();
            console.log('🌐 Nueva red configurada:', currentNetworkConfig.networkName);
            console.log('🌐 Nueva dirección ICO:', currentNetworkConfig.icoAddress);

            // Reinicializar contratos de solo lectura con la nueva red
            await initReadOnlyContracts();

            // Si hay wallet conectada, reinicializar contratos con la nueva red
            if (userAddress) {
                console.log('🔄 Reinicializando contratos con nueva red...');
                // Limpiar contratos anteriores
                icoContract = null;
                usdtContract = null;
                provider = null;
                signer = null;

                // Reconectar con la nueva red
                try {
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                    await initContracts();
                    updateWalletUI();
                    // Verificar aprobación USDT después de cambiar de red
                    if (usdtContract && userAddress) {
                        await updateUSDTApprovalUI();
                    }
                    console.log('✅ Contratos reinicializados con nueva red');
                } catch (error) {
                    console.error('❌ Error reinicializando contratos:', error);
                    alert('Error al cambiar de red. Por favor recarga la página.');
                    window.location.reload();
                    return;
                }
            }

            // Actualizar estadísticas con la nueva red
            await updateICOStats();

            // Actualizar enlace de auditoría
            updateAuditContractLink();

            // Mostrar mensaje informativo
            const networkName = currentNetworkConfig.networkName;
            alert(`Red cambiada a ${networkName}.\n\nLos contratos se han actualizado automáticamente.`);
        } catch (error) {
            console.error('❌ Error actualizando configuración de red:', error);
            alert('Error al cambiar de red. La página se recargará.');
            window.location.reload();
        }
        console.log('🌐 ===== FIN CAMBIO DE RED =====');
    });

    // Validación periódica mejorada: compara la cuenta seleccionada en MetaMask con la de la app
    // Esta es la forma más confiable de detectar cambios de cuenta
    validationInterval = setInterval(async () => {
        // Si las validaciones están pausadas, no hacer nada (evita flood)
        if (validationPaused) {
            return;
        }

        if (window.ethereum && userAddress) {
            try {
                const storedAddress = userAddress.toLowerCase();

                // PASO 1: Obtener la cuenta seleccionada actualmente en MetaMask (modo silencioso para evitar popups)
                const currentSelectedAccount = await getCurrentSelectedAccount(true); // true = modo silencioso

                // Si no hay cuenta seleccionada (usuario cambió a cuenta no autorizada)
                if (!currentSelectedAccount) {
                    // Verificar si el signer sigue funcionando
                    if (signer) {
                        try {
                            const signerAddress = await signer.getAddress();
                            const signerAddressLower = signerAddress.toLowerCase();

                            // Si el signer no coincide con la cuenta almacenada, hay un problema
                            if (signerAddressLower !== storedAddress) {
                                // PAUSAR validaciones y mostrar alert
                                pauseValidation();

                                const message = `⚠️ Cambio de cuenta detectado\n\n` +
                                    `La aplicación está conectada a:\n${storedAddress.substring(0, 6)}...${storedAddress.substring(38)}\n\n` +
                                    `Pero el signer apunta a:\n${signerAddressLower.substring(0, 6)}...${signerAddressLower.substring(38)}\n\n` +
                                    `Por favor, autoriza la cuenta correcta en MetaMask.`;

                                alert(message);

                                // Reconectar después del alert
                                userAddress = null;
                                lastKnownMetaMaskAccount = signerAddressLower;
                                provider = null;
                                signer = null;
                                icoContract = null;
                                usdtContract = null;

                                // Intentar reconectar
                                await connectWallet();
                                resumeValidation();
                                return;
                            }

                            // Intentar hacer una operación con el signer
                            try {
                                await signer.getTransactionCount();
                            } catch (e) {
                                // PAUSAR validaciones y mostrar alert
                                pauseValidation();

                                const message = `⚠️ Cambio de cuenta detectado\n\n` +
                                    `El signer ya no puede hacer operaciones.\n\n` +
                                    `Esto indica que cambiaste de cuenta en MetaMask.\n\n` +
                                    `Por favor, autoriza la nueva cuenta.`;

                                alert(message);

                                showAccountChangedWarning(null);
                                userAddress = null;
                                lastKnownMetaMaskAccount = null;
                                provider = null;
                                signer = null;
                                icoContract = null;
                                usdtContract = null;
                                updateWalletUI();

                                // Intentar reconectar
                                await connectWallet();
                                resumeValidation();
                                return;
                            }
                        } catch (e) {
                            // PAUSAR validaciones y mostrar alert
                            pauseValidation();

                            const message = `⚠️ Error de conexión\n\n` +
                                `No se puede obtener la dirección del signer.\n\n` +
                                `Por favor, reconecta tu wallet.`;

                            alert(message);

                            showAccountChangedWarning(null);
                            userAddress = null;
                            lastKnownMetaMaskAccount = null;
                            provider = null;
                            signer = null;
                            icoContract = null;
                            usdtContract = null;
                            updateWalletUI();

                            // Intentar reconectar
                            await connectWallet();
                            resumeValidation();
                            return;
                        }
                    }

                    // Si no hay cuenta seleccionada y no hay signer válido, limpiar estado
                    // PAUSAR validaciones y mostrar alert
                    pauseValidation();

                    const message = `⚠️ Cambio de cuenta detectado\n\n` +
                        `La aplicación estaba conectada a:\n${storedAddress.substring(0, 6)}...${storedAddress.substring(38)}\n\n` +
                        `Pero no hay cuenta autorizada en MetaMask.\n\n` +
                        `Esto indica que cambiaste a una cuenta no autorizada.\n\n` +
                        `Por favor, autoriza la cuenta correcta.`;

                    alert(message);

                    showAccountChangedWarning(null);
                    userAddress = null;
                    lastKnownMetaMaskAccount = null;
                    provider = null;
                    signer = null;
                    icoContract = null;
                    usdtContract = null;
                    updateWalletUI();

                    // Intentar reconectar
                    await connectWallet();
                    resumeValidation();
                    return;
                }

                // PASO 2: Comparar la cuenta seleccionada en MetaMask con la almacenada en la app
                const currentAccountLower = currentSelectedAccount.toLowerCase();

                // Actualizar última cuenta conocida
                if (lastKnownMetaMaskAccount !== currentAccountLower) {
                    lastKnownMetaMaskAccount = currentAccountLower;
                }

                // CASO CRÍTICO: La cuenta seleccionada en MetaMask es diferente a la almacenada en la app
                if (storedAddress !== currentAccountLower) {
                    // PAUSAR validaciones y mostrar alert
                    pauseValidation();

                    const message = `⚠️ Cambio de cuenta detectado\n\n` +
                        `La aplicación está conectada a:\n${storedAddress.substring(0, 6)}...${storedAddress.substring(38)}\n\n` +
                        `Pero MetaMask muestra:\n${currentAccountLower.substring(0, 6)}...${currentAccountLower.substring(38)}\n\n` +
                        `¿Deseas reconectar con la cuenta actual de MetaMask?`;

                    const reconectar = confirm(message);

                    if (reconectar) {
                        showAccountChangedWarning(currentAccountLower);
                        userAddress = null;
                        lastKnownMetaMaskAccount = currentAccountLower;
                        provider = null;
                        signer = null;
                        icoContract = null;
                        usdtContract = null;
                        await connectWallet();
                    } else {
                        // Si el usuario cancela, limpiar estado
                        userAddress = null;
                        lastKnownMetaMaskAccount = null;
                        provider = null;
                        signer = null;
                        icoContract = null;
                        usdtContract = null;
                        updateWalletUI();
                    }

                    resumeValidation();
                    return;
                }

                // PASO 3: Verificar que el signer coincide con la cuenta seleccionada
                if (signer) {
                    try {
                        const signerAddress = await signer.getAddress();
                        const signerAddressLower = signerAddress.toLowerCase();

                        if (signerAddressLower !== currentAccountLower) {
                            // PAUSAR validaciones y mostrar alert
                            pauseValidation();

                            const message = `⚠️ Cambio de cuenta detectado\n\n` +
                                `El signer apunta a:\n${signerAddressLower.substring(0, 6)}...${signerAddressLower.substring(38)}\n\n` +
                                `Pero MetaMask muestra:\n${currentAccountLower.substring(0, 6)}...${currentAccountLower.substring(38)}\n\n` +
                                `¿Deseas reconectar con la cuenta actual de MetaMask?`;

                            const reconectar = confirm(message);

                            if (reconectar) {
                                showAccountChangedWarning(currentAccountLower);
                                userAddress = null;
                                lastKnownMetaMaskAccount = currentAccountLower;
                                provider = null;
                                signer = null;
                                icoContract = null;
                                usdtContract = null;
                                await connectWallet();
                            } else {
                                // Si el usuario cancela, limpiar estado
                                userAddress = null;
                                lastKnownMetaMaskAccount = null;
                                provider = null;
                                signer = null;
                                icoContract = null;
                                usdtContract = null;
                                updateWalletUI();
                            }

                            resumeValidation();
                            return;
                        }
                    } catch (e) {
                        // PAUSAR validaciones y mostrar alert
                        pauseValidation();

                        const message = `⚠️ Error de conexión\n\n` +
                            `No se puede obtener la dirección del signer.\n\n` +
                            `Por favor, reconecta tu wallet.`;

                        alert(message);

                        showAccountChangedWarning(null);
                        userAddress = null;
                        lastKnownMetaMaskAccount = null;
                        provider = null;
                        signer = null;
                        icoContract = null;
                        usdtContract = null;
                        updateWalletUI();

                        // Intentar reconectar
                        await connectWallet();
                        resumeValidation();
                        return;
                    }
                }

                // Todo está bien - las cuentas coinciden

            } catch (error) {
                console.error('Error en validación periódica de cuenta:', error);
                // Si hay un error de conexión, limpiar estado por seguridad
                if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('Unauthorized')) {
                    console.warn('⚠️ Error de autorización, limpiando estado...');
                    userAddress = null;
                    lastKnownMetaMaskAccount = null;
                    provider = null;
                    signer = null;
                    icoContract = null;
                    usdtContract = null;
                    updateWalletUI();
                }
            }
        } else if (window.ethereum && !userAddress) {
            // Si no hay cuenta conectada pero hay ethereum, verificar si hay una cuenta disponible
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0 && accounts[0].toLowerCase() !== lastKnownMetaMaskAccount) {
                    console.log('📝 Nueva cuenta disponible, actualizando referencia');
                    lastKnownMetaMaskAccount = accounts[0].toLowerCase();
                }
            } catch (e) {
                // Ignorar errores silenciosamente
            }
        }
    }, 1000); // Verificar cada 1 segundo (reducido para evitar flood, las validaciones se pausan cuando hay cambios)

    // Guardar referencia al intervalo para poder limpiarlo si es necesario
    window.icoValidationInterval = validationInterval;
}

