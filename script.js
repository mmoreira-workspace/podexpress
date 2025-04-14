function separarBlocosPorClienteTopDown(input) {
    const todasAsLinhas = input.split('\n');
    let blocos = [];
    let linhasDoBlocoAtual = [];

    for (let i = 0; i < todasAsLinhas.length; i++) {
        const linhaOriginal = todasAsLinhas[i].trim();

        if (linhaOriginal.match(/^Cliente:\s*.+/i)) {
            const nomeCliente = linhaOriginal.replace(/^Cliente:\s*/i, '').trim();

            blocos.push({
                cliente: nomeCliente,
                linhas: linhasDoBlocoAtual
            });

            linhasDoBlocoAtual = [];
        } else {
            linhasDoBlocoAtual.push(linhaOriginal);
        }
    }

    if (linhasDoBlocoAtual.length > 0) {
        blocos.push({
            cliente: 'SemCliente',
            linhas: linhasDoBlocoAtual
        });
    }

    return blocos;
}

function processarBlocoDeLinhas(bloco, estruturas, config) {
    let tamanhoAtual = null;

    const tamanhosValidos = new Set(config.tamanhosValidos.map(t =>
        t.toUpperCase().replace(/\s+/g, ' ')
    ));

    if (!estruturas.clientes[bloco.cliente]) {
        estruturas.clientes[bloco.cliente] = {
            sabores: {},
            totaisTamanhos: {},
            pedidos: []
        };
    }

    bloco.linhas.forEach(linhaOriginal => {
        let linhaProcessada = linhaOriginal
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, ' ');

        // Object.entries(config.variacoesTamanhos).forEach(([padrao, correto]) => {
        //     const regex = new RegExp(padrao, 'gi');
        //     linhaProcessada = linhaProcessada.replace(regex, correto.toUpperCase());
        // });

        const possivelTamanho = Array.from(tamanhosValidos).find(t => {
            const regex = new RegExp(`\\b${t.replace(/\s+/g, '\\s*')}\\b`, 'i');
            return regex.test(linhaProcessada);
        });

        if (possivelTamanho) {
            tamanhoAtual = possivelTamanho;

            estruturas.totaisTamanhos[tamanhoAtual] =
                (estruturas.totaisTamanhos[tamanhoAtual] || 0);
            estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] =
                (estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] || 0);

            estruturas.clientes[bloco.cliente].pedidos.push({
                tamanho: tamanhoAtual,
                valor: linhaOriginal.match(/\d+[\d,.]*/) ? linhaOriginal.match(/\d+[\d,.]*/)[0] : '',
                itens: []
            });

            return;
        }

        if (tamanhoAtual && tamanhosValidos.has(tamanhoAtual)) {
            let matchVenda = linhaOriginal.match(/^\s*(\d+)\s+([\w.\s]+.*?)\s*$/i);

            if (matchVenda) {
                const [_, quantidadeStr, saborBruto] = matchVenda;
                const quantidade = parseInt(quantidadeStr, 10);

                let sabor = saborBruto
                .replace(/[^A-Za-z0-9.\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .toUpperCase();

                Object.entries(config.variacoesSabores).forEach(([errado, certo]) => {
                    sabor = sabor.replace(new RegExp(errado, 'gi'), certo.toUpperCase());
                });

                if (!estruturas.sabores[sabor]) {
                    estruturas.sabores[sabor] = { tamanhos: {}, total: 0 };
                }
                estruturas.sabores[sabor].tamanhos[tamanhoAtual] =
                    (estruturas.sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;
                estruturas.sabores[sabor].total += quantidade;

                estruturas.totaisTamanhos[tamanhoAtual] =
                    (estruturas.totaisTamanhos[tamanhoAtual] || 0) + quantidade;

                if (!estruturas.clientes[bloco.cliente].sabores[sabor]) {
                    estruturas.clientes[bloco.cliente].sabores[sabor] = { tamanhos: {}, total: 0 };
                }
                estruturas.clientes[bloco.cliente].sabores[sabor].tamanhos[tamanhoAtual] =
                    (estruturas.clientes[bloco.cliente].sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;
                estruturas.clientes[bloco.cliente].sabores[sabor].total += quantidade;

                estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] =
                    (estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] || 0) + quantidade;

                const pedidos = estruturas.clientes[bloco.cliente].pedidos;
                if (pedidos.length > 0) {
                    const ultimoPedido = pedidos[pedidos.length - 1];
                    ultimoPedido.itens.push({ sabor, quantidade });
                }
            }
        }
    });
}

function processarDadosVendas(input) {
    const config = {
        tamanhosValidos: [
            'V15', 'V35', 'V40', 'V50', 'V80', 'V120', 'V150', 'V150 15K', 'V250',
            'REFIL 10K', 'ELFBAR 10K', 'ELF10K', 'ELF EW KIT',
            'BLACK 20K', 'ELF BAR 30K', 'ELFBAR 30K', 'JULL', 'JUUL', 'REFIL P100',
            'REFILP100', 'ELF9K', 'ELF 9K', 'LIFE POD SK', 'LIFE POD REFIL 8K',
            'ZYN', 'ZYN Nicotine Pouches', 'TACJA', 'ELFBAR 23K', 'ELFBAR23K', 'BLACK SHEEP 20K',
            'BLVK 35', 'BLVK 50', 'BLVK 20', 'BLVK SALT', 'CALIBURN A2', 'CALIBURN A3',
            'CALIBURN G', 'CALIBURN KOKO PRIME', 'RENOVA ZERO 1.0', 'DICKBAR 10K', 'ELF BAR 10KBC',
            'ELFBAR 10KBC', 'ELF BAR 16K', 'ELFBAR 16K', 'ELF BAR 18K', 'ELFBAR 18K', 'ELF BAR 18K TOUCH',
            'ELFBAR 18K TOUCH', 'ELF BAR TOUCH', 'ELFBAR TOUCH', 'ELF BAR 30KTE', 'ELFBAR 30KTE',
            'ELF BAR 5KTE', 'ELFBAR 5KTE', 'EW 16K REFIL', 'EW16K REFIL', 'ELF BAR EW 16000 REFIL',
            'ELF BAR EW 16K REFIL', 'ELFBAR EW 16K REFIL', 'EW 9K REFIL', 'EW9K REFIL', 'ELF BAR EW 9K REFIL',
            'ELFBAR EW 9K REFIL', 'ELF BAR EW 9000 REFIL', 'KIT EW 9K', 'KIT EW9K', 'ELF BAR EW 9K',
            'ELFBAR EW 9K', 'ELF BAR EW 9000', "ELFBAR EW 9000", 'ELF BAR GH23K', 'ELFBAR GH23K', 'GH23K', '23K',
            'ELF BAR GOLDEN 10KBC', 'ELFBAR GOLDEN 10KBC', "Elfbar gold bc10k", 'ELF BAR ICE KING 40K', 'ELFBAR ICE KING 40K',
            'KING 40K', 'ELF WORLD PE10K', 'ELFWORLD PE10K', 'PE10K', 'ELFBAR NICOTINE PUNCH', 'PUNCH',
            'ELFLIQ SALT', 'SALT', 'ELF LIQ SALT', 'FUNKY REPUBLIC TI 7K', 'GEEKBAR 15000 PULSE',
            'GEEKBAR 15K PULSE', 'HIIO', 'HIIO BY MASKKING', 'IGNITE CART P100', 'IGNITE KIT P100',
            'JUICE MASKKING 3.5', 'JUICE MASKKING 5', 'JUICE MASKKING 2', 'JUICE MR FREEZER',
            'MR FREEZER', 'MRFREEZER', 'JUICE NAKED', 'NAKED', 'KICK NICOTINE POUCHES',
            'LIFE POD ECO', 'LIFE POD KIT', 'LIFE POD REFIL', 'LOST ANGEL 20K', 'LOST MARY 16K',
            'MASKKING AROMA 6K', 'MASKKING EVO 5K', 'MR FREEZE 0', 'MR FREEZE 3', 'OXBAR 10K PRO',
            'OXBAR 30K PRO', 'OXBAR 8K', 'OXBAR 9500', 'PYNE POD BOOST 20K', 'RabBeats RC10000',
            'STIG NICOTINE POUNCHES', 'STIG NICOTINE POUCHES', 'STIG POUCHES NICOTINE', 'STIG POUNCHES NICOTINE', 'UWELL CALIBURN', 'Vaporesso Coil GT Cores',
            'yGG pouches', 'VELO', 'VAPORESSO XROS NANO 4', 'VAPORESSO XROS NANO 3',
            'VAPORESSO XROS NANO', 'VAPORESSO XROS 4', 'VAPORESSO XROS 3', 'VAPORESSO XROS',
            'VAPORESSO RENOVA COIL ZERO 1.2', 'VAPORESSO RENOVA COIL ZERO 1.0', 'VAPORESSO RENOVA COIL ZERO',
            'VAPORESSO KIT ZERO 2', 'VAPORESSO KIT ZERO 1', 'VAPORESSO COIL XROS 1.0',
            'VAPORESSO COIL XROS 0.8', 'VAPORESSO COIL XROS 0.6',
            'BATERIA EW', 'ELFBAR 10KBC TOUCH', 'ELFBAR EW 9K REFIL',
            'FREE', 'RabBeats 10K', 'VAPORESSO COIL', "RABBEATS 10K", "HELLWIT", 'HELWIT', "UWELL CALIBURN", "UWEL CALIBURN",
            'VAPORESSO KIT', 'VAPORESSO RENOVA', 'YGG POUCHES', 'ZEN SNUS', 'V50 Prateado', "PABLO", "Pablo", "VAPORESSO"
        ],
        termosIgnorar: ['FREte', '\\+', 'R\\$', 'REFIL', 'POD', 'º', 'ª', '°'],
        variacoesSabores: {
            'GREPE': 'GRAPE',
            'BLUBERRY': 'BLUEBERRY',
            'BABBALOO': 'BUBBALOO',
            'ICEMENTA': 'ICE MENTA',
            'KIWY': 'KIWI',
            'STRAWBERRY': 'STRAWBERRY',
            'GRAEPE': 'GRAPE'
        },
        // variacoesTamanhos: {
        //     "BATERIA": "BATERIA EW",
        //     "BLACKSHEEP 20K": "BLACK SHEEP 20K",
        //     "CALIBURN KOKO": "CALIBURN KOKO PRIME",
        //     "CALIBURN PRIME": "CALIBURN KOKO PRIME",
        //     "RENOVA ZERO": "RENOVA ZERO 1.0",
        //     "RENOVA 1.0": "RENOVA ZERO 1.0",
        //     "DICK BAR 10K": "DICKBAR 10K",
        //     "ELF BAR 10KBC": "ELFBAR 10KBC",
        //     "ELFBAR 10K": "ELFBAR 10KBC",
        //     "ELF BAR 10K": "ELFBAR 10KBC",
        //     "ELFBAR TOUCH": "ELFBAR 10KBC TOUCH",
        //     "ELF BAR 10KBC TOUCH": "ELFBAR 10KBC TOUCH",
        //     "ELF BAR 16K": "ELFBAR 16K",
        //     "ELF BAR 18K": "ELFBAR 18K",
        //     "ELF BAR 18K TOUCH": "ELFBAR 18K TOUCH",
        //     "ELF BAR 30K": "ELFBAR 30KTE",
        //     "ELF BAR 5K": "ELFBAR 5KTE",
        //     "ELF BAR 30KTE": "ELFBAR 30KTE",
        //     "ELF BAR 5KTE": "ELFBAR 5KTE",
        //     "ELF BAR EW 16K": "ELFBAR EW 16K REFIL",
        //     "ELF BAR 16K": "ELFBAR EW 16K REFIL",
        //     "ELFBAR 16K": "ELFBAR EW 16K REFIL",
        //     "ELF BAR EW 9K": "ELFBAR EW 9K REFIL",
        //     "ELF BAR EW 9K REFIL": "ELFBAR EW 9K REFIL",
        //     "ELFBAR 9K": "ELFBAR EW 9K REFIL",
        //     "ELF BAR 9K": "ELFBAR EW 9K REFIL",
        //     "ELFBAR 23K": "ELFBAR GH23K",
        //     "ELF BAR 23K": "ELFBAR GH23K",
        //     "ELF BAR GH23K": "ELFBAR GH23K",
        //     "ELF BAR GOLDEN 10KBC": "ELFBAR GOLDEN 10KBC",
        //     "ELF BAR GOLDEN 10K": "ELFBAR GOLDEN 10KBC",
        //     "ELFBAR GOLDEN 10K": "ELFBAR GOLDEN 10KBC",
        //     "ELF BAR ICE KING 40K": "ELFBAR ICE KING 40K",
        //     "ELF BAR ICE 40K": "ELFBAR ICE KING 40K",
        //     "ELFBAR 40K": "ELFBAR ICE KING 40K",
        //     "ELF BAR 40K": "ELFBAR ICE KING 40K",
        //     "ELF WORLD 10K": "ELF WORLD PE10K",
        //     "ELFBAR WORLD 10K": "ELF WORLD PE10K",
        //     "ELF BAR WORLD 10K": "ELF WORLD PE10K",
        //     "ELF BAR WORLD PE10K": "ELF WORLD PE10K",
        //     "ELF BAR NICOTINE PUNCH": "ELFBAR NICOTINE PUNCH",
        //     "ELF LIQ SALT": "ELFLIQ SALT",
        //     "HIIO": "HIOO BY MASKKING",
        //     "IGNITE CART": "IGNITE CART P100",
        //     "IGNITE KIT": "IGNITE KIT P100",
        //     "JUICE 3.5": "JUICE MASKKING 3.5",
        //     "JUICE 5": "JUICE MASKKING 5",
        //     "JUICE 2": "JUICE MASKKING 2",
        //     "JUICE MR": "JUICE MR FREEZER",
        //     "JUICE FREEZER": "JUICE MR FREEZER",
        //     "KICK NICOTINE": "KICK NICOTINE POUCHES",
        //     "LIFEPOD ECO": "LIFE POD ECO",
        //     "LIFE ECO": "LIFE POD ECO",
        //     "LIFEPOD KIT": "LIFE POD KIT",
        //     "LIFE KIT": "LIFE POD KIT",
        //     "LIFE REFIL 8K": "LIFE POD REFIL 8K",
        //     "LIFE POD 8K": "LIFE POD REFIL 8K",
        //     "LIFEPOD 8K": "LIFE POD REFIL 8K",
        //     "LIFE SK": "LIFE POD SK",
        //     "OXBAR 10K": "OKBAR 10K PRO",
        //     "OXBAR 30K": "OKBAR 30K PRO",
        //     "OKBAR 9.5K": "OKBAR 9500",
        //     "PYNE 20K": "PYNE POD BOOST 20K",
        //     "PYNE POD 20K": "PYNE POD BOOST 20K",
        //     "PYNE BOOST 20K": "PYNE POD BOOST 20K",
        //     "RAB BEASTS 10K": "RABBEATS 10K",
        //     "STIG NICOTINE": "STIG NICOTINE POUNCHES",
        //     "STIG POUNCHES": "STIG NICOTINE POUNCHES",
        //     "YGG": "YGG POUCHES",
        // }
    };

    const blocos = separarBlocosPorClienteTopDown(input);

    const estruturas = {
        sabores: {},
        totaisTamanhos: {},
        clientes: {}
    };

    blocos.forEach(bloco => {
        processarBlocoDeLinhas(bloco, estruturas, config);
    });

    return {
        sabores: estruturas.sabores,
        totaisTamanhos: estruturas.totaisTamanhos,
        clientes: estruturas.clientes
    };
}

function processarDados() {
    const input = document.getElementById('inputDados').value;
    const resultadoConsolidadoDiv = document.getElementById('resultado-consolidado');
    const clientesContainer = document.getElementById('clientes-container');

    resultadoConsolidadoDiv.innerHTML = '';
    clientesContainer.innerHTML = '';

    try {
        const { sabores, totaisTamanhos, clientes } = processarDadosVendas(input);

        const tabelaConsolidada = gerarTabelaFormatada(sabores, totaisTamanhos);
        resultadoConsolidadoDiv.innerHTML = '<pre>' + tabelaConsolidada + '</pre>';

        for (const [nomeCliente, dadosCliente] of Object.entries(clientes)) {
            if (Object.keys(dadosCliente.sabores).length === 0) continue;

            const boxCliente = document.createElement('div');
            boxCliente.className = 'box-cliente';

            const titulo = document.createElement('div');
            titulo.className = 'box-cliente-titulo';
            titulo.textContent = `Cliente: ${nomeCliente}`;
            boxCliente.appendChild(titulo);

            const conteudo = document.createElement('div');
            conteudo.className = 'box-cliente-conteudo';

            const tabelaCliente = gerarTabelaFormatada(dadosCliente.sabores, dadosCliente.totaisTamanhos);
            conteudo.innerHTML = '<pre>' + tabelaCliente + '</pre>';

            boxCliente.appendChild(conteudo);
            clientesContainer.appendChild(boxCliente);
        }

    } catch (error) {
        resultadoConsolidadoDiv.textContent = 'Erro: ' + error.message;
    }
}

function gerarTabelaFormatada(sabores, totaisTamanhos) {
    const ordemTamanhos = [
        'V15', 'V35', 'V40', 'V50', 'V80', 'V120', 'V150', 'V150 15K', 'V250',
        'REFIL 10K', 'ELFBAR 10K', 'ELF10K', 'ELF EW KIT',
        'BLACK 20K', 'ELF BAR 30K', 'ELFBAR 30K', 'JULL', 'JUUL', 'REFIL P100',
        'REFILP100', 'ELF9K', 'ELF 9K', 'LIFE POD SK', 'LIFE POD REFIL 8K',
        'ZYN', 'ZYN Nicotine Pouches', 'TACJA', 'ELFBAR 23K', 'ELFBAR23K', 'BLACK SHEEP 20K',
        'BLVK 35', 'BLVK 50', 'BLVK 20', 'BLVK SALT', 'CALIBURN A2', 'CALIBURN A3',
        'CALIBURN G', 'CALIBURN KOKO PRIME', 'RENOVA ZERO 1.0', 'DICKBAR 10K', 'ELF BAR 10KBC',
        'ELFBAR 10KBC', 'ELF BAR 16K', 'ELFBAR 16K', 'ELF BAR 18K', 'ELFBAR 18K', 'ELF BAR 18K TOUCH',
        'ELFBAR 18K TOUCH', 'ELF BAR TOUCH', 'ELFBAR TOUCH', 'ELF BAR 30KTE', 'ELFBAR 30KTE',
        'ELF BAR 5KTE', 'ELFBAR 5KTE', 'EW 16K REFIL', 'EW16K REFIL', 'ELF BAR EW 16000 REFIL',
        'ELF BAR EW 16K REFIL', 'ELFBAR EW 16K REFIL', 'EW 9K REFIL', 'EW9K REFIL', 'ELF BAR EW 9K REFIL',
        'ELFBAR EW 9K REFIL', 'ELF BAR EW 9000 REFIL', 'KIT EW 9K', 'KIT EW9K', 'ELF BAR EW 9K',
        'ELFBAR EW 9K', 'ELF BAR EW 9000', "ELFBAR EW 9000", 'ELF BAR GH23K', 'ELFBAR GH23K', 'GH23K', '23K',
        'ELF BAR GOLDEN 10KBC', 'ELFBAR GOLDEN 10KBC', "Elfbar gold bc10k", 'ELF BAR ICE KING 40K', 'ELFBAR ICE KING 40K',
        'KING 40K', 'ELF WORLD PE10K', 'ELFWORLD PE10K', 'PE10K', 'ELFBAR NICOTINE PUNCH', 'PUNCH',
        'ELFLIQ SALT', 'SALT', 'ELF LIQ SALT', 'FUNKY REPUBLIC TI 7K', 'GEEKBAR 15000 PULSE',
        'GEEKBAR 15K PULSE', 'HIIO', 'HIIO BY MASKKING', 'IGNITE CART P100', 'IGNITE KIT P100',
        'JUICE MASKKING 3.5', 'JUICE MASKKING 5', 'JUICE MASKKING 2', 'JUICE MR FREEZER',
        'MR FREEZER', 'MRFREEZER', 'JUICE NAKED', 'NAKED', 'KICK NICOTINE POUCHES',
        'LIFE POD ECO', 'LIFE POD KIT', 'LIFE POD REFIL', 'LOST ANGEL 20K', 'LOST MARY 16K',
        'MASKKING AROMA 6K', 'MASKKING EVO 5K', 'MR FREEZE 0', 'MR FREEZE 3', 'OXBAR 10K PRO',
        'OXBAR 30K PRO', 'OXBAR 8K', 'OXBAR 9500', 'PYNE POD BOOST 20K', 'RabBeats RC10000',
        'STIG NICOTINE POUNCHES', 'STIG NICOTINE POUCHES', 'STIG POUCHES NICOTINE', 'STIG POUNCHES NICOTINE', 'UWELL CALIBURN', 'Vaporesso Coil GT Cores',
        'yGG pouches', 'VELO', 'VAPORESSO XROS NANO 4', 'VAPORESSO XROS NANO 3',
        'VAPORESSO XROS NANO', 'VAPORESSO XROS 4', 'VAPORESSO XROS 3', 'VAPORESSO XROS',
        'VAPORESSO RENOVA COIL ZERO 1.2', 'VAPORESSO RENOVA COIL ZERO 1.0', 'VAPORESSO RENOVA COIL ZERO',
        'VAPORESSO KIT ZERO 2', 'VAPORESSO KIT ZERO 1', 'VAPORESSO COIL XROS 1.0',
        'VAPORESSO COIL XROS 0.8', 'VAPORESSO COIL XROS 0.6',
        'BATERIA EW', 'ELFBAR 10KBC TOUCH', 'ELFBAR EW 9K REFIL',
        'FREE', 'RabBeats 10K', 'VAPORESSO COIL', "RABBEATS 10K", "HELLWIT", 'HELWIT', "UWELL CALIBURN", "UWEL CALIBURN",
        'VAPORESSO KIT', 'VAPORESSO RENOVA', 'YGG POUCHES', 'ZEN SNUS', 'V50 Prateado', "PABLO", "Pablo", "VAPORESSO"
    ].filter(t => t in totaisTamanhos);

    const cabecalho = ['Sabor', ...ordemTamanhos, 'Total'];
    const linhas = [cabecalho];

    Object.keys(sabores)
        .sort((a, b) => a.localeCompare(b))
        .forEach(sabor => {
            const linha = [sabor];
            ordemTamanhos.forEach(t => linha.push(sabores[sabor].tamanhos[t] || 0));
            linha.push(sabores[sabor].total);
            linhas.push(linha);
        });

    linhas.push([
        'TOTAL',
        ...ordemTamanhos.map(t => totaisTamanhos[t]),
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)
    ]);

    const calcularLarguras = () => {
        return cabecalho.map((_, i) =>
            Math.max(...linhas.map(row => String(row[i]).length))
        );
    };

    const criarLinha = (conteudo, larguras) => {
        return '│ ' + conteudo
            .map((cell, i) => String(cell).padEnd(larguras[i]))
            .join(' │ ') + ' │';
    };

    const criarSeparador = (larguras) => {
        return '├─' + larguras.map(l => '─'.repeat(l)).join('─┼─') + '─┤';
    };

    const larguras = calcularLarguras();
    let tabela = [];

    tabela.push(criarLinha(cabecalho, larguras));
    tabela.push(criarSeparador(larguras));

    linhas.slice(1).forEach(linha => {
        tabela.push(criarLinha(linha, larguras));
    });

    return tabela.join('\n');
}

function baixarCSV() {
    const input = document.getElementById('inputDados').value;
    const nomeArquivoInput = document.getElementById('nomeArquivo').value.trim();
    const nomeArquivo = nomeArquivoInput ? nomeArquivoInput : 'relatorio_vendas';

    try {
        const { sabores, totaisTamanhos, clientes } = processarDadosVendas(input);

        let csvContent = [];
        csvContent.push('=== RELATÓRIO GERAL ===');
        csvContent.push('');
        csvContent.push(...gerarCSVTabela(sabores, totaisTamanhos));
        csvContent.push('');
        csvContent.push('');
        csvContent.push('=== RELATÓRIO POR CLIENTE ===');
        csvContent.push('');

        for (const [nomeCliente, dadosCliente] of Object.entries(clientes)) {
            if (Object.keys(dadosCliente.sabores).length === 0) continue;

            csvContent.push(`CLIENTE: ${nomeCliente}`);
            csvContent.push('');
            csvContent.push(...gerarCSVTabela(dadosCliente.sabores, dadosCliente.totaisTamanhos));
            csvContent.push('');
            csvContent.push('');
        }

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${nomeArquivo}.csv`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        alert('Erro ao gerar CSV: ' + error.message);
    }
}

function gerarCSVTabela(sabores, totaisTamanhos) {
    const ordemTamanhos = [
        'V15', 'V35', 'V40', 'V50', 'V80', 'V120', 'V150', 'V150 15K', 'V250',
        'REFIL 10K', 'ELFBAR 10K', 'ELF10K', 'ELF EW KIT',
        'BLACK 20K', 'ELF BAR 30K', 'ELFBAR 30K', 'JULL', 'JUUL', 'REFIL P100',
        'REFILP100', 'ELF9K', 'ELF 9K', 'LIFE POD SK', 'LIFE POD REFIL 8K',
        'ZYN', 'ZYN Nicotine Pouches', 'TACJA', 'ELFBAR 23K', 'ELFBAR23K', 'BLACK SHEEP 20K',
        'BLVK 35', 'BLVK 50', 'BLVK 20', 'BLVK SALT', 'CALIBURN A2', 'CALIBURN A3',
        'CALIBURN G', 'CALIBURN KOKO PRIME', 'RENOVA ZERO 1.0', 'DICKBAR 10K', 'ELF BAR 10KBC',
        'ELFBAR 10KBC', 'ELF BAR 16K', 'ELFBAR 16K', 'ELF BAR 18K', 'ELFBAR 18K', 'ELF BAR 18K TOUCH',
        'ELFBAR 18K TOUCH', 'ELF BAR TOUCH', 'ELFBAR TOUCH', 'ELF BAR 30KTE', 'ELFBAR 30KTE',
        'ELF BAR 5KTE', 'ELFBAR 5KTE', 'EW 16K REFIL', 'EW16K REFIL', 'ELF BAR EW 16000 REFIL',
        'ELF BAR EW 16K REFIL', 'ELFBAR EW 16K REFIL', 'EW 9K REFIL', 'EW9K REFIL', 'ELF BAR EW 9K REFIL',
        'ELFBAR EW 9K REFIL', 'ELF BAR EW 9000 REFIL', 'KIT EW 9K', 'KIT EW9K', 'ELF BAR EW 9K',
        'ELFBAR EW 9K', 'ELF BAR EW 9000', "ELFBAR EW 9000", 'ELF BAR GH23K', 'ELFBAR GH23K', 'GH23K', '23K',
        'ELF BAR GOLDEN 10KBC', 'ELFBAR GOLDEN 10KBC', "Elfbar gold bc10k", 'ELF BAR ICE KING 40K', 'ELFBAR ICE KING 40K',
        'KING 40K', 'ELF WORLD PE10K', 'ELFWORLD PE10K', 'PE10K', 'ELFBAR NICOTINE PUNCH', 'PUNCH',
        'ELFLIQ SALT', 'SALT', 'ELF LIQ SALT', 'FUNKY REPUBLIC TI 7K', 'GEEKBAR 15000 PULSE',
        'GEEKBAR 15K PULSE', 'HIIO', 'HIIO BY MASKKING', 'IGNITE CART P100', 'IGNITE KIT P100',
        'JUICE MASKKING 3.5', 'JUICE MASKKING 5', 'JUICE MASKKING 2', 'JUICE MR FREEZER',
        'MR FREEZER', 'MRFREEZER', 'JUICE NAKED', 'NAKED', 'KICK NICOTINE POUCHES',
        'LIFE POD ECO', 'LIFE POD KIT', 'LIFE POD REFIL', 'LOST ANGEL 20K', 'LOST MARY 16K',
        'MASKKING AROMA 6K', 'MASKKING EVO 5K', 'MR FREEZE 0', 'MR FREEZE 3', 'OXBAR 10K PRO',
        'OXBAR 30K PRO', 'OXBAR 8K', 'OXBAR 9500', 'PYNE POD BOOST 20K', 'RabBeats RC10000',
        'STIG NICOTINE POUNCHES', 'STIG NICOTINE POUCHES', 'STIG POUCHES NICOTINE', 'STIG POUNCHES NICOTINE', 'UWELL CALIBURN', 'Vaporesso Coil GT Cores',
        'yGG pouches', 'VELO', 'VAPORESSO XROS NANO 4', 'VAPORESSO XROS NANO 3',
        'VAPORESSO XROS NANO', 'VAPORESSO XROS 4', 'VAPORESSO XROS 3', 'VAPORESSO XROS',
        'VAPORESSO RENOVA COIL ZERO 1.2', 'VAPORESSO RENOVA COIL ZERO 1.0', 'VAPORESSO RENOVA COIL ZERO',
        'VAPORESSO KIT ZERO 2', 'VAPORESSO KIT ZERO 1', 'VAPORESSO COIL XROS 1.0',
        'VAPORESSO COIL XROS 0.8', 'VAPORESSO COIL XROS 0.6',
        'BATERIA EW', 'ELFBAR 10KBC TOUCH', 'ELFBAR EW 9K REFIL',
        'FREE', 'RabBeats 10K', 'VAPORESSO COIL', "RABBEATS 10K", "HELLWIT", 'HELWIT', "UWELL CALIBURN", "UWEL CALIBURN",
        'VAPORESSO KIT', 'VAPORESSO RENOVA', 'YGG POUCHES', 'ZEN SNUS', 'V50 Prateado', "PABLO", "Pablo", "VAPORESSO"
    ].filter(t => t in totaisTamanhos);

    const cabecalho = ['Sabor', ...ordemTamanhos, 'Total'];
    const linhas = [cabecalho.join(',')];

    Object.keys(sabores)
        .sort((a, b) => a.localeCompare(b))
        .forEach(sabor => {
            const linha = [sabor];
            ordemTamanhos.forEach(t => linha.push(sabores[sabor].tamanhos[t] || 0));
            linha.push(sabores[sabor].total);
            linhas.push(linha.join(','));
        });

    const totalLine = [
        'TOTAL',
        ...ordemTamanhos.map(t => totaisTamanhos[t]),
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)
    ];
    linhas.push(totalLine.join(','));

    return linhas;
}