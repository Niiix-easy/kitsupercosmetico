import { ProductBundle, Review, PurchaseNotification } from '../types';

export const PRODUCT_BUNDLES: ProductBundle[] = [
  {
    id: 'kit-home-care',
    title: 'Kit Home Care Reconstrução',
    tagline: 'Ideal para manutenção e restauração capilar diária com hidratação profunda',
    badge: 'Para Uso Diário',
    popular: false,
    stepsCount: 3,
    originalPrice: 299.70,
    price: 185.80,
    installmentsCount: 12,
    installmentValue: 18.58,
    savings: 113.90,
    freeShipping: true,
    gifts: ['Guia Digital do Cronograma Capilar Dyusar'],
    itemsIncluded: [
      'Shampoo Super Reconstruction 300ml',
      'Condicionador Super Reconstruction 300ml',
      'Máscara Super Reconstruction 300g'
    ],
    image: '/images/kit-home-care-300ml.webp?v=luxury5'
  },
  {
    id: 'kit-profissional-1litro',
    title: 'Kit Profissional 1 Litro',
    tagline: 'Rendimento de salão: até 60 aplicações de reconstrução de alto impacto',
    badge: '🏆 MAIS POPULAR',
    popular: true,
    stepsCount: 3,
    originalPrice: 504.00,
    price: 247.00,
    installmentsCount: 12,
    installmentValue: 24.70,
    savings: 257.00,
    freeShipping: true,
    gifts: [
      'Escova Polvo Anti-Quebra Flexível',
      'Válvulas Pump Dosadoras Profissionais',
      'E-book Cronograma SOS Reconstrutor'
    ],
    itemsIncluded: [
      'Shampoo Super Reconstruction 1 Litro',
      'Condicionador Super Reconstruction 1 Litro',
      'Máscara Super Reconstruction 1kg'
    ],
    image: '/images/kit-profissional-1litro.webp?v=luxury5'
  },
  {
    id: 'kit-profissional-completo',
    title: 'Kit Profissional Completo',
    tagline: 'Protocolo master com Queratina Líquida 500ml para interrupção de corte químico',
    badge: 'Kit Completo',
    popular: false,
    stepsCount: 4,
    originalPrice: 658.00,
    price: 348.74,
    installmentsCount: 12,
    installmentValue: 34.87,
    savings: 309.26,
    freeShipping: true,
    gifts: [
      'Óleo Sublime Ojon Reparador 60ml',
      'Escova Polvo Anti-Quebra Flexível',
      'Válvula Spray Especial para Cauterização',
      'Certificado Digital de Terapia Capilar Dyusar'
    ],
    itemsIncluded: [
      'Shampoo Super Reconstruction 1 Litro',
      'Condicionador Super Reconstruction 1 Litro',
      'Máscara Super Reconstruction 1kg',
      'Queratina Líquida 500ml'
    ],
    image: '/images/kit-profissional-completo.webp?v=luxury5'
  }
];

export const TREATMENT_STEPS = [
  {
    number: '01',
    tag: 'Limpeza Fisiológica',
    name: 'Shampoo Hidratante Reparador',
    subtitle: 'Abertura cuticular suave com pH 5.5',
    action: 'Higieniza profundamente os fios removendo impurezas e metais pesados sem agredir a fibra, preparando a cutícula para a absorção máxima dos bio-aminoácidos.',
    howToUse: 'Aplique nos cabelos úmidos, massageie o couro cabeludo suavemente até formar espuma cremosa e enxágue 100% com água morna a fria.'
  },
  {
    number: '02',
    tag: 'Antiemborrachamento em 60s',
    name: 'Queratina Líquida Córtex Repair',
    subtitle: '18 aminoácidos bio-idênticos concentrados',
    action: 'Penetra instantaneamente no córtex capilar rompido, neutralizando a elasticidade excessiva e cessando o corte químico na hora.',
    howToUse: 'Borrife mecha a mecha uniformemente no comprimento e pontas ainda úmidos. Penteie suavemente para distribuir. Não enxágue.'
  },
  {
    number: '03',
    tag: 'Liporreposição & Blindagem',
    name: 'Máscara Super Reconstrução Ojon',
    subtitle: 'Manteiga de Murumuru e Ceramidas tipo III',
    action: 'Envelopa cada fio com lipídios nobres, selando a queratina do Passo 2 e devolvendo maciez extrema, peso e balanço natural.',
    howToUse: 'Aplique sobre a Queratina mecha a mecha, enluvando de cima para baixo. Deixe agir de 10 a 15 minutos e enxágue abundantemente.'
  },
  {
    number: '04',
    tag: 'Selagem Térmica 230°C',
    name: 'Leave-in Selante Anti-Frizz',
    subtitle: 'Filme protetor termo-ativado 24 horas',
    action: 'Cria uma película impermeável invisível que blinda os fios contra secador e chapinha (até 230°C), bloqueando umidade externa e conferindo brilho espelhado 3D.',
    howToUse: 'Espalhe uma pequena quantidade na palma das mãos e distribua uniformemente do comprimento às pontas. Finalize com secador ou chapinha.'
  }
];

export const ACTIVE_INGREDIENTS = [
  {
    name: 'Nano Queratina Biomimética',
    role: 'Reconstrução Estrutural',
    description: 'Moléculas microscópicas que penetram as microfissuras da haste capilar, reconstruindo as pontes de dissulfeto rompidas por descolorações sucessivas e químicas agressivas.',
    provenResult: '+97% de resistência à quebra na primeira sessão'
  },
  {
    name: 'Óleo Nobre de Ojon Centro-Americano',
    role: 'Liporreposição Profunda',
    description: 'Rico em ácidos graxos essenciais e lipídios semelhantes aos produzidos naturalmente pelo couro cabeludo, recupera o brilho vitrificado e a emoliência sem pesar.',
    provenResult: 'Reposição de até 94% dos lipídios perdidos'
  },
  {
    name: 'Manteiga de Murumuru da Amazônia',
    role: 'Selagem Cuticular e Anti-Frizz',
    description: 'Ativo 100% brasileiro que cria um escudo flexível em torno da fibra, reduzindo a porosidade e impedindo a perda de umidade para o ambiente.',
    provenResult: '72 horas de proteção contínua contra umidade e frizz'
  },
  {
    name: 'Complexo de 18 Aminoácidos Puros',
    role: 'Densidade e Massa Capilar',
    description: 'Matriz proteica completa contendo Arginina, Cisteína, Serina e Prolina, que devolve a espessura de fios afinados por processos químicos repetidos.',
    provenResult: '+38% de aumento na densidade do fio em 14 dias'
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Dra. Camila Vasconcelos',
    location: 'São Paulo, SP',
    hairType: 'Loiro Platinado 10.0',
    rating: 5,
    title: 'Salvou meu cabelo de um corte químico gravíssimo!',
    comment: 'Tive um corte químico horrível após uma descoloração malsucedida no salão. Meu cabelo ficou igual a um chiclete, quebrando ao pentear. Já no primeiro uso do Passo 2 (Queratina) com a máscara, o emborrachamento parou na hora. Uso há 3 semanas e parece outro cabelo. Recomendo de olhos fechados!',
    date: 'Há 3 dias',
    verified: true,
    hasPhoto: true,
    photoUrl: '/images/hair-before-after-case1.webp?v=orig_v1'
  },
  {
    id: 'rev-2',
    name: 'Juliana Mendes Santos',
    location: 'Curitiba, PR',
    hairType: 'Cabelo Iluminado com Mechas',
    rating: 5,
    title: 'Adotei no meu salão e o faturamento disparou!',
    comment: 'Como profissional com mais de 12 anos de bancada, raramente vejo um produto com ação tão imediata no lavatório. Quando a cliente chega com o fio sem elasticidade pós-mechas, aplico o protocolo Dyusar de 4 passos. O cabelo sai selado, com brilho espelhado e sem pontas duplas. O kit se paga logo nas primeiras aplicações.',
    date: 'Há 5 dias',
    verified: true,
    hasPhoto: true,
    photoUrl: '/images/hair-before-after-case2.webp?v=img12_v3',
    salonProfessional: true
  },
  {
    id: 'rev-3',
    name: 'Mariana Duarte',
    location: 'Belo Horizonte, MG',
    hairType: 'Crespo Tipo 4A com Coloração',
    rating: 5,
    title: 'Definição, força e zero ressecamento!',
    comment: 'Meu maior medo com produtos reconstrutores era deixar o fio duro e rígido. O Kit da Dyusar é completamente diferente porque a máscara e o leave-in devolvem uma maciez inacreditável. Meus cachos ficaram definidos, encorpados e resistentes.',
    date: 'Há 1 semana',
    verified: true,
    hasPhoto: false
  }
];

export const FAQ_DATA = [
  {
    question: 'O kit deixa o cabelo endurecido ou pesado?',
    answer: 'Não! Muitas queratinas comuns no mercado enrijecem os fios porque não possuem reposição lipídica associada. O diferencial exclusivo do Kit Dyusar é o equilíbrio entre a queratina biomimética (Passo 2) e os óleos nobres de Ojon e Murumuru (Passo 3 e 4), que nutrem e emolientam o fio enquanto reconstroem a medula.'
  },
  {
    question: 'Serve para cabelos com progressiva, botox ou alisamentos?',
    answer: 'Sim, é 100% compatível com qualquer química, seja formol, ácidos orgânicos, tioglicolato de amônia ou guanidina. Inclusive, é altamente recomendado para restaurar a resistência antes e depois de retoques de raiz.'
  },
  {
    question: 'Qual a frequência de uso recomendada?',
    answer: 'Para cabelos em estado de corte químico ou muito emborrachados, recomendamos usar o protocolo completo 1x por semana nas primeiras duas semanas. Conforme o fio recuperar a resistência natural, alterne para uso a cada 15 dias para manutenção.'
  },
  {
    question: 'Quanto tempo dura cada kit?',
    answer: 'O Kit Home Care 300ml rende em média de 18 a 22 aplicações completas em cabelos médios. O Kit Profissional de 1 Litro rende de 55 a 65 aplicações, sendo a escolha ideal para máximo rendimento e economia.'
  },
  {
    question: 'Como funciona a Garantia Incondicional de 7 Dias?',
    answer: 'Nós confiamos tanto na fórmula Dyusar que oferecemos 7 dias de teste incondicional. Se você não notar seu cabelo mais resistente, encorpado e brilhante, basta enviar uma mensagem no WhatsApp do nosso suporte oficial (66) 99677-2704 e devolveremos 100% do seu dinheiro sem questionamentos.'
  },
  {
    question: 'Qual o prazo de envio e rastreamento?',
    answer: 'Todos os pedidos confirmados até as 14h são despachados no mesmo dia útil via Correios (Sedex/PAC) ou transportadora expressa Jadlog. Você recebe o código de rastreamento com seguro de carga diretamente no seu WhatsApp e e-mail cadastrado.'
  }
];

export const PURCHASE_NOTIFICATIONS: PurchaseNotification[] = [
  {
    id: 'n-1',
    name: 'Renata M.',
    city: 'Ribeirão Preto',
    state: 'SP',
    bundleTitle: 'Kit Profissional 1 Litro',
    timeAgo: 'há 2 minutos',
    photoUrl: '/images/avatar-blonde.webp'
  },
  {
    id: 'n-2',
    name: 'Dra. Beatriz S.',
    city: 'Belo Horizonte',
    state: 'MG',
    bundleTitle: 'Kit Profissional Completo',
    timeAgo: 'há 4 minutos',
    photoUrl: '/images/avatar-brunette.webp'
  },
  {
    id: 'n-3',
    name: 'Salão Studio Bella',
    city: 'Curitiba',
    state: 'PR',
    bundleTitle: 'Kit Profissional 1 Litro',
    timeAgo: 'há 7 minutos',
    photoUrl: '/images/avatar-salon.webp'
  },
  {
    id: 'n-4',
    name: 'Carla F.',
    city: 'Porto Alegre',
    state: 'RS',
    bundleTitle: 'Kit Home Care Reconstrução',
    timeAgo: 'há 11 minutos',
    photoUrl: '/images/avatar-brunette.webp'
  }
];

export const BEFORE_AFTER_CASES = [
  {
    id: 'case-1',
    title: 'Cabelo Iluminado com Porosidade Extrema e Pontas Duplas',
    badge: 'Porosidade Alta e Frizz',
    hairProfile: 'Cabelo com luzes e mechas iluminadas tom mel/caramelo, ressecado por uso contínuo de chapinha e secador',
    sessionCount: '2 semanas de cronograma capilar',
    diagnostic: 'Cabelo opaco, pontas espigadas com nós de fada e alta perda de umidade natural para o ar.',
    result: 'Brilho espelhado 3D duradouro, emoliência sedosa e blindagem térmica contra calor de até 230°C.',
    beforeImage: '/images/hair-before-after-case1.webp',
    afterImage: '/images/hair-before-after-case1.webp'
  },
  {
    id: 'case-2',
    title: 'Recuperação de Corte Químico Pós-Descoloração 10.0',
    badge: 'Corte Químico Crítico',
    hairProfile: 'Loiro claríssimo danificado por mechas sucessivas e pó descolorante',
    sessionCount: '1 única aplicação completa no lavatório',
    diagnostic: 'Fio emborrachado com perda de elasticidade, rompendo-se com leve tração dos dedos e cutículas completamente abertas.',
    result: 'Interrupção instantânea do efeito chiclete, reposição da massa cortical interna e selagem com alinhamento das escamas capilares.',
    beforeImage: '/images/hair-before-after-case2.webp',
    afterImage: '/images/hair-before-after-case2.webp'
  }
];

export const STEP_BY_STEP_DATA = TREATMENT_STEPS;
export const INGREDIENTS_DATA = ACTIVE_INGREDIENTS;
export const FAQS_DATA = FAQ_DATA;
export const MOCK_NOTIFICATIONS = PURCHASE_NOTIFICATIONS;
