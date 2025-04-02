function processarDados() {
    const input = document.getElementById('inputDados').value;
    const resultadoDiv = document.getElementById('resultado');

    try {
        const { sabores, totaisTamanhos } = processarDadosVendas(input);
        const tabelaFormatada = gerarTabelaFormatada(sabores, totaisTamanhos);
        resultadoDiv.textContent = tabelaFormatada;
    } catch (error) {
        resultadoDiv.textContent = '❌ Erro: ' + error.message;
    }
}

function processarDadosVendas(input) {
    const config = {
        tamanhosValidos: [
            'V15', 'V35', 'V40', 'V50', 'V80', 'V120', 'V150', 'V150 15K', 'V250',
            'REFIL 10K', 'ELFBAR 10K', 'ELF10K', 'ELF EW KIT',
            'BLACK 20K', 'ELF BAR 30K', 'ELFBAR 30K', 'JULL', 'REFIL P100',
            'REFILP100', 'ELF9K', 'ELF 9K', 'LIFE POD SK', 'LIFE POD REFIL 8K',
            'ZYN', 'ZYN Nicotine Pouches', 'TACJA', 'ELFBAR 23K', 'ELFBAR23K', 'BLACK SHEEP 20K', 'BATERIA',
            'BLVK 35', 'BLVK 50', 'BLVK 20', 'BLVK SALT', 'CALIBURN A2', 'CALIBURN A3',
            'CALIBURN G', 'CALIBURN KOKO PRIME', 'RENOVA ZERO 1.0', 'DICKBAR 10K', 'ELF BAR 10KBC',
            'ELFBAR 10KBC', 'ELF BAR 16K', 'ELFBAR 16K', 'ELF BAR 18K', 'ELFBAR 18K', 'ELF BAR 18K TOUCH',
            'ELFBAR 18K TOUCH', 'ELF BAR TOUCH', 'ELFBAR TOUCH', 'ELF BAR 30KTE', 'ELFBAR 30KTE',
            'ELF BAR 5KTE', 'ELFBAR 5KTE', 'EW 16K REFIL', 'EW16K REFIL', 'ELF BAR EW 16000 REFIL',
            'ELF BAR EW 16K REFIL', 'ELFBAR EW 16K REFIL', 'EW 9K REFIL', 'EW9K REFIL', 'ELF BAR EW 9K REFIL',
            'ELF BAR EW 9K REFIL', 'ELFBAR EW 9K REFIL', 'ELF BAR EW 9000 REFIL', 'KIT EW 9K', 'KIT EW9K', 'ELF BAR EW 9K',
            'ELF BAR EW 9K', 'ELFBAR EW 9K', 'ELF BAR EW 9000', 'ELF BAR GH23K', 'ELFBAR GH23K', 'GH23K', '23K',
            'ELF BAR GOLDEN 10KBC', 'ELFBAR GOLDEN 10KBC', 'ELF BAR ICE KING 40K', 'ELFBAR ICE KING 40K',
            'KING 40K', 'ELF WORLD PE10K', 'ELFWORLD PE10K', 'PE10K', 'ELFBAR NICOTINE PUNCH', 'PUNCH',
            'ELFLIQ SALT', 'SALT', 'ELF LIQ SALT', 'FUNKY REPUBLIC TI 7K', 'GEEKBAR 15000 PULSE',
            'GEEKBAR 15K PULSE', 'HIIO', 'HIIO BY MASKKING', 'IGNITE CART P100', 'IGNITE KIT P100',
            'JUICE MASKKING 3.5', 'JUICE MASKKING 5', 'JUICE MASKKING 2', 'JUICE MR FREEZER',
            'MR FREEZER', 'MRFREEZER', 'JUICE NAKED', 'NAKED', 'KICK NICOTINE POUCHES',
            'LIFE POD ECO', 'LIFE POD KIT', 'LIFE POD REFIL', 'LIFE POD REFIL 8K',
            'LOST ANGEL 20K', 'LOST MARY 16K', 'MASKKING AROMA 6K', 'MASKKING EVO 5K',
            'MR FREEZE 0', 'MR FREEZE 3', 'OXBAR 10K PRO', 'OXBAR 30K PRO', 'OXBAR 8K',
            'OXBAR 9500', 'PYNE POD BOOST 20K', 'RabBeats RC10000', 'STIG NICOTINE POUNCHES',
            'UWELL CALIBURN', 'Vaporesso Coil GT Cores',
            'yGG pouches', 'VELO', 'VAPORESSO XROS NANO 4', 'VAPORESSO XROS NANO 3',
            'VAPORESSO XROS NANO', 'VAPORESSO XROS 4', 'VAPORESSO XROS 3', 'VAPORESSO XROS', 'VAPORESSO RENOVA COIL ZERO 1.2',
            'VAPORESSO RENOVA COIL ZERO 1.0', 'VAPORESSO RENOVA COIL ZERO', 'VAPORESSO KIT ZERO 2', 'VAPORESSO KIT ZERO 1',
            'VAPORESSO COIL XROS 1.0', 'VAPORESSO COIL XROS 0.8', 'VAPORESSO COIL XROS 0.6'

        ],
        termosIgnorar: ['FREte', '\\+', 'R\\$', 'REFIL', 'POD', 'º', 'ª', '°'],
        variacoesSabores: {
            'GREPE': 'GRAPE',
            'BLUBERRY': 'BLUEBERRY',
            'MENTHOL✅': 'MENTHOL',
            'BABBALOO': 'BUBBALOO',
            'ICEMENTA': 'ICE MENTA',
            'KIWY': 'KIWI',
            'STRAWBERRY': 'STRAWBERRY',
            'GRAEPE': 'GRAPE'
        }
    };

    const sabores = {};
    const totaisTamanhos = {};
    let tamanhoAtual = null;
    const tamanhosValidos = new Set(config.tamanhosValidos.map(t => t.toUpperCase().replace(/\s+/g, ' ')));

    input.split('\n').forEach(linha => {
        const linhaOriginal = linha.trim();
        const linhaProcessada = linhaOriginal.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');

        const possivelTamanho = Array.from(tamanhosValidos).find(t => {
            const regex = new RegExp(`\\b${t.replace(/\s+/g, '\\s*')}\\b`, 'i');
            return regex.test(linhaProcessada);
        });

        if (possivelTamanho) {
            tamanhoAtual = possivelTamanho; 
            if (tamanhosValidos.has(tamanhoAtual)) {
                totaisTamanhos[tamanhoAtual] = totaisTamanhos[tamanhoAtual] || 0;
                return;
            }
        }

        if (tamanhoAtual && tamanhosValidos.has(tamanhoAtual)) {
            const matchVenda = linhaOriginal.match(/^\s*(\d+)\s*([^\d]+?)\s*[\W]*$/);
            if (matchVenda) {
                const [_, quantidadeStr, saborBruto] = matchVenda;
                const quantidade = parseInt(quantidadeStr);
                let sabor = saborBruto
                    .replace(/[^A-Za-z\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toUpperCase();

                Object.entries(config.variacoesSabores).forEach(([errado, correto]) => {
                    sabor = sabor.replace(new RegExp(errado, 'gi'), correto.toUpperCase());
                });

                if (!sabores[sabor]) {
                    sabores[sabor] = { tamanhos: {}, total: 0 };
                }

                sabores[sabor].tamanhos[tamanhoAtual] =
                    (sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;

                sabores[sabor].total += quantidade;
                totaisTamanhos[tamanhoAtual] = (totaisTamanhos[tamanhoAtual] || 0) + quantidade;
            }
        }
    });

    return { sabores, totaisTamanhos };
}

function gerarTabelaFormatada(sabores, totaisTamanhos) {
    const ordemTamanhos = [
        'V15', 'V35', 'V40', 'V50', 'V80', 'V120', 'V150', 'V150 15K', 'V250',
        'REFIL 10K', 'ELFBAR 10K', 'ELF10K', 'ELF EW KIT',
        'BLACK 20K', 'ELF BAR 30K', 'ELFBAR 30K', 'JULL', 'REFIL P100',
        'REFILP100', 'ELF9K', 'ELF 9K', 'LIFE POD SK', 'LIFE POD REFIL 8K',
        'ZYN', 'ZYN Nicotine Pouches', 'TACJA', 'ELFBAR 23K', 'ELFBAR23K', 'BLACK SHEEP 20K', 'BATERIA',
        'BLVK 35', 'BLVK 50', 'BLVK 20', 'BLVK SALT', 'CALIBURN A2', 'CALIBURN A3',
        'CALIBURN G', 'CALIBURN KOKO PRIME', 'RENOVA ZERO 1.0', 'DICKBAR 10K', 'ELF BAR 10KBC',
        'ELFBAR 10KBC', 'ELF BAR 16K', 'ELFBAR 16K', 'ELF BAR 18K', 'ELFBAR 18K', 'ELF BAR 18K TOUCH',
        'ELFBAR 18K TOUCH', 'ELF BAR TOUCH', 'ELFBAR TOUCH', 'ELF BAR 30KTE', 'ELFBAR 30KTE',
        'ELF BAR 5KTE', 'ELFBAR 5KTE', 'EW 16K REFIL', 'EW16K REFIL', 'ELF BAR EW 16000 REFIL',
        'ELF BAR EW 16K  REFIL', 'ELFBAR EW 16K REFIL', 'EW 9K REFIL', 'EW9K REFIL', 'ELF BAR EW 9K REFIL',
        'ELF BAR EW 9K REFIL', 'ELFBAR EW 9K REFIL', 'ELF BAR EW 9000 REFIL', 'KIT EW 9K', 'KIT EW9K', 'ELF BAR EW 9K',
        'ELF BAR EW 9K', 'ELFBAR EW 9K', 'ELF BAR EW 9000', 'ELF BAR GH23K', 'ELFBAR GH23K', 'GH23K', '23K',
        'ELF BAR GOLDEN 10KBC', 'ELFBAR GOLDEN 10KBC', 'ELF BAR ICE KING 40K', 'ELFBAR ICE KING 40K',
        'KING 40K', 'ELF WORLD PE10K', 'ELFWORLD PE10K', 'PE10K', 'ELFBAR NICOTINE PUNCH', 'PUNCH',
        'ELFLIQ SALT', 'SALT', 'ELF LIQ SALT', 'FUNKY REPUBLIC TI 7K', 'GEEKBAR 15000 PULSE',
        'GEEKBAR 15K PULSE', 'HIIO', 'HIIO BY MASKKING', 'IGNITE CART P100', 'IGNITE KIT P100',
        'JUICE MASKKING 3.5', 'JUICE MASKKING 5', 'JUICE MASKKING 2', 'JUICE MR FREEZER',
        'MR FREEZER', 'MRFREEZER', 'JUICE NAKED', 'NAKED', 'KICK NICOTINE POUCHES',
        'LIFE POD ECO', 'LIFE POD KIT', 'LIFE POD REFIL', 'LIFE POD REFIL 8K',
        'LOST ANGEL 20K', 'LOST MARY 16K', 'MASKKING AROMA 6K', 'MASKKING EVO 5K',
        'MR FREEZE 0', 'MR FREEZE 3', 'OXBAR 10K PRO', 'OXBAR 30K PRO', 'OXBAR 8K',
        'OXBAR 9500', 'PYNE POD BOOST 20K', 'RabBeats RC10000', 'STIG NICOTINE POUNCHES',
        'UWELL CALIBURN AK3', 'UWELL CALIBURN KOKO PRIME', 'Vaporesso Coil GT Cores',
        'yGG pouches', 'VELO', 'VAPORESSO XROS NANO 4', 'VAPORESSO XROS NANO 3',
        'VAPORESSO XROS NANO', 'VAPORESSO XROS 4', 'VAPORESSO XROS 3', 'VAPORESSO XROS', 'VAPORESSO RENOVA COIL ZERO 1.2',
        'VAPORESSO RENOVA COIL ZERO 1.0', 'VAPORESSO RENOVA COIL ZERO', 'VAPORESSO KIT ZERO 2', 'VAPORESSO KIT ZERO 1',
        'VAPORESSO COIL XROS 1.0', 'VAPORESSO COIL XROS 0.8', 'VAPORESSO COIL XROS 0.6'
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

    linhas.push(['TOTAL', ...ordemTamanhos.map(t => totaisTamanhos[t]),
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)]);

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

function gerarCSV(sabores, totaisTamanhos) {
    const ordemTamanhos = Object.keys(totaisTamanhos);
    const cabecalho = ['Sabor', ...ordemTamanhos, 'Total'];
    const linhas = [cabecalho];

    Object.keys(sabores).forEach(sabor => {
        const linha = [sabor];
        ordemTamanhos.forEach(tamanho => linha.push(sabores[sabor].tamanhos[tamanho] || 0));
        linha.push(sabores[sabor].total);
        linhas.push(linha);
    });

    linhas.push(['TOTAL', ...ordemTamanhos.map(t => totaisTamanhos[t]), 
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)]);

    return linhas.map(linha => linha.join(',')).join('\n');
}

function baixarCSV() {
    const input = document.getElementById('inputDados').value;
    const { sabores, totaisTamanhos } = processarDadosVendas(input);
    const csv = gerarCSV(sabores, totaisTamanhos);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultado.csv';
    link.click();
    URL.revokeObjectURL(url);
}
