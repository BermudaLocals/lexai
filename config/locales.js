// config/locales.js - CENTRAL LANGUAGE FILE FOR COMPLETE SITE
// Both sides pull from here: lexai.llc/business AND lexai.llc/legal / lawyer side
// Languages: EN, ES, PT, FR, JA, ZH, KO - Asia included
// Drop into BermudaLocals/lexai repo as config/locales.js

const locales = {
  EN: {
    code: 'EN', flag: '🇺🇸', name: 'English',
    common: {
      brand: 'LEXAI.LLC',
      business: 'BUSINESS',
      legal: 'LEGAL',
      login: 'LOGIN',
      start: 'START',
      cancelAnytime: 'Cancel anytime',
      noTrials: 'No trials — flat pricing that covers fees & commission • Cancel anytime',
      cheaperThanNDA: 'CHEAPER THAN ONE NDA • $350/hr lawyer vs $49',
      poweredBy: '© {year} LEXAI.LLC — BUSINESS PRICING',
      soc: 'SOC 2 • VAULT ENCRYPTED • 99.9% UPTIME',
      vaultSecure: 'vault-encrypted • soc-2 • dpa-ready • production-grade'
    },
    nav: {
      business: 'BUSINESS',
      legal: 'LEGAL',
      pricing: 'PRICING',
      login: 'LOGIN',
      dashboard: 'DASHBOARD'
    },
    business: {
      overline: '// PRICING FOR BUSINESS',
      title: 'Pricing that scales with your business',
      sub: 'Same engine lawyers use at $1,500/mo.',
      desc: 'Business-grade legal AI. 16 engines, shared vault, risk scoring. Built for operators, not billable hours. Start at $49.',
      plansLine: 'PLANS: BASIC $49 — SOLO SMB $150 — LARGER COMPANY $450 • No trials, flat pricing covers fees & commission',
      ndaBox: {
        title: 'COST OF ONE NDA: $350/hr lawyer vs LexAI $49',
        desc: 'Basic $49 = 7x cheaper than one NDA. Solo $150 = unlimited NDAs. Larger $450 = 5 users = $90/user = still cheaper than 1 hour of lawyer time. Covers fees & commission - profitable by design.'
      },
      plans: {
        basic: {
          id: 'basic', code: 'PLAN 00 / BASIC', name: 'BASIC / STARTER', badge: 'GET SIGNUPS', price: 49, per: '/mo',
          pdesc: '1 business • 50 docs/mo • starter vault',
          cta: 'START BASIC — $49', foot: 'CHEAPER THAN ONE NDA • UPGRADE ANYTIME',
          features: [
            '1 business - 50 docs/mo',
            'Core 6 - Draft to Research',
            '2GB vault - Risk basics',
            'Email support',
            'Upgrade anytime to Solo'
          ]
        },
        solo: {
          id: 'solo', code: 'PLAN 01 / SOLO', name: 'SOLO / SMB BUSINESS', badge: '1', price: 150, per: '/mo',
          pdesc: '$150 / business • unlimited docs',
          cta: 'START SOLO — $150', foot: 'FOR SOLO OPERATORS • CANCEL ANYTIME',
          features: [
            '1 business - unlimited docs',
            'All 16 AI - Draft to ApiAccess',
            '10GB — Risk 0-100',
            'Email support — SOC 2 vault'
          ]
        },
        larger: {
          id: 'larger', code: 'PLAN 02 / LARGER', name: 'LARGER COMPANY / TEAM', badge: 'MOST POPULAR — $450', users: '5 USERS', price: 450, per: '/mo',
          pdesc: 'Up to 5 users • $450 total • shared workspaces',
          cta: 'START TEAM — $450', foot: '5 USERS • PROFITABLE BY DESIGN',
          features: [
            'Up to 5 users included',
            'Everything in Solo +',
            'Shared vault + Self-learning AI',
            'Priority chat + 50GB vault',
            '500 credits included',
            'Shared workspaces',
            'Covers fees & commission - profitable by design'
          ]
        }
      }
    },
    legal: {
      overline: '// PRICING FOR LAW FIRMS',
      title: 'Pricing that scales with your firm',
      sub: 'Same engine businesses use at $49/mo.',
      desc: 'Lawyer-grade legal AI. 16 engines, case law, litigation. Built for billable hours.',
      plans: {
        solo: { id: 'solo_law', code: 'PLAN 01 / SOLO', name: 'SOLO LAWYER', price: 150, per: '/mo' },
        team: { id: 'team_law', code: 'PLAN 02 / TEAM', name: 'LAW FIRM / TEAM', price: 450, per: '/mo' }
      }
    },
    footer: {
      engines: '// 16 AI ENGINES — SAME AS LAW FIRMS',
      terms: 'TERMS', dpa: 'DPA', security: 'SECURITY', status: 'STATUS'
    },
    checkout: {
      title: 'Checkout',
      email: 'Email',
      secure: 'Secure checkout via PayPal'
    }
  },

  ES: {
    code: 'ES', flag: '🇪🇸', name: 'Español',
    common: { brand: 'LEXAI.LLC', business: 'EMPRESAS', legal: 'LEGAL', login: 'ENTRAR', start: 'EMPEZAR', cancelAnytime: 'Cancela cuando quieras', noTrials: 'Sin pruebas — precio fijo que cubre tarifas y comisión', cheaperThanNDA: 'MÁS BARATO QUE UN NDA CON ABOGADO ($350)', poweredBy: '© {year} LEXAI.LLC — PRECIOS EMPRESAS', soc: 'SOC 2 • BÓVEDA CIFRADA • 99.9% UPTIME', vaultSecure: 'bóveda-cifrada • soc-2 • dpa-listo' },
    nav: { business: 'EMPRESAS', legal: 'LEGAL', pricing: 'PRECIOS', login: 'ENTRAR', dashboard: 'PANEL' },
    business: {
      overline: '// PRECIOS PARA EMPRESAS',
      title: 'Precios que escalan con tu negocio',
      sub: 'El mismo motor que abogados usan por $1,500/mes.',
      desc: 'IA legal de nivel empresarial. 16 motores, bóveda compartida. Desde $49.',
      plansLine: 'PLANES: BÁSICO $49 — SOLO PYME $150 — EMPRESA GRANDE $450 • Sin pruebas',
      ndaBox: { title: 'COSTO DE UN NDA: $350/h abogado vs LexAI $49', desc: 'Básico $49 = 7x más barato que un NDA. Solo $150 = NDAs ilimitados. Grande $450 = 5 usuarios = $90/usuario.' },
      plans: {
        basic: { id: 'basic', code: 'PLAN 00 / BÁSICO', name: 'BÁSICO / INICIO', badge: 'CONSIGUE REGISTROS', price: 49, per: '/mes', pdesc: '1 empresa • 50 docs/mes • bóveda inicial', cta: 'EMPEZAR BÁSICO — $49', foot: 'MÁS BARATO QUE UN NDA ($350) • MEJORA LIBRE', features: ['1 empresa - 50 docs/mes','6 principales - Borrador a Investigación','2GB bóveda - Riesgo básico','Soporte por email','Mejora a Solo cuando quieras'] },
        solo: { id: 'solo', code: 'PLAN 01 / SOLO', name: 'SOLO / PYME', badge: '1', price: 150, per: '/mes', pdesc: '$150 / empresa • docs ilimitados', cta: 'EMPEZAR SOLO — $150', foot: 'PARA OPERADORES SOLO • CANCELA CUANDO QUIERAS', features: ['1 empresa - docs ilimitados','Los 16 IA - Borrador a ApiAccess','10GB — Riesgo 0-100','Soporte — bóveda SOC 2'] },
        larger: { id: 'larger', code: 'PLAN 02 / LARGER', name: 'EMPRESA GRANDE / EQUIPO', badge: 'MÁS POPULAR — $450', users: '5 USUARIOS', price: 450, per: '/mes', pdesc: 'Hasta 5 usuarios • $450 total', cta: 'EMPEZAR EQUIPO — $450', foot: '5 USUARIOS • RENTABLE POR DISEÑO', features: ['Hasta 5 usuarios incluidos','Todo en Solo +','Bóveda compartida + IA auto-aprendizaje','Chat prioritario + 50GB','500 créditos incluidos','Espacios compartidos','Cubre tarifas y comisión'] }
      }
    },
    legal: { overline: '// PRECIOS PARA ABOGADOS', title: 'Precios que escalan con tu firma', sub: 'El mismo motor', desc: 'IA legal de nivel abogado.' },
    footer: { engines: '// 16 MOTORES IA — IGUAL QUE FIRMAS', terms: 'TÉRMINOS', dpa: 'DPA', security: 'SEGURIDAD', status: 'ESTADO' },
    checkout: { title: 'Pago', email: 'Correo', secure: 'Pago seguro vía PayPal' }
  },

  JA: {
    code: 'JA', flag: '🇯🇵', name: '日本語',
    common: { brand: 'LEXAI.LLC', business: 'ビジネス', legal: '法律', login: 'ログイン', start: '開始', cancelAnytime: 'いつでもキャンセル可能', noTrials: 'トライアルなし — 手数料・コミッション込みの定額料金', cheaperThanNDA: 'NDA 1件より安い • 弁護士 $350/時間 vs $49', poweredBy: '© {year} LEXAI.LLC — ビジネス料金', soc: 'SOC 2 • 暗号化保管庫 • 99.9% 稼働率', vaultSecure: '暗号化保管庫 • soc-2 • dpa対応' },
    nav: { business: 'ビジネス', legal: '法律', pricing: '料金', login: 'ログイン', dashboard: 'ダッシュボード' },
    business: {
      overline: '// ビジネス向け料金',
      title: 'ビジネスに合わせて拡張する料金',
      sub: '弁護士が$1,500/月で使う同じエンジン。',
      desc: 'ビジネスグレードの法務AI。16エンジン、共有保管庫、リスクスコア。$49から開始。',
      plansLine: 'プラン: ベーシック $49 — ソロ $150 — 大企業 $450 • トライアルなし',
      ndaBox: { title: 'NDA 1件のコスト: 弁護士 $350/時間 vs LexAI $49', desc: 'ベーシック $49 = NDA 1件より7倍安い。ソロ $150 = NDA無制限。大企業 $450 = 5ユーザー = $90/ユーザー。' },
      plans: {
        basic: { id: 'basic', code: 'プラン 00 / ベーシック', name: 'ベーシック / スターター', badge: 'サインアップ獲得', price: 49, per: '/月', pdesc: '1ビジネス • 50ドキュメント/月', cta: 'ベーシック開始 — $49', foot: 'NDA 1件より安い • いつでもアップグレード', features: ['1ビジネス - 50ドキュメント/月','コア6 - ドラフトからリサーチ','2GB保管庫 - 基本リスク','メールサポート','いつでもソロにアップグレード'] },
        solo: { id: 'solo', code: 'プラン 01 / ソロ', name: 'ソロ / 中小ビジネス', badge: '1', price: 150, per: '/月', pdesc: '$150 / ビジネス • 無制限ドキュメント', cta: 'ソロ開始 — $150', foot: 'ソロ運営者向け • いつでもキャンセル', features: ['1ビジネス - 無制限ドキュメント','全16 AI - ドラフトからApiAccess','10GB — リスク 0-100','メールサポート — SOC 2保管庫'] },
        larger: { id: 'larger', code: 'プラン 02 / 大企業', name: '大企業 / チーム', badge: '最も人気 — $450', users: '5ユーザー', price: 450, per: '/月', pdesc: '最大5ユーザー • $450合計', cta: 'チーム開始 — $450', foot: '5ユーザー • 利益設計', features: ['最大5ユーザー含む','ソロの全て +','共有保管庫 + 自己学習AI','優先チャット + 50GB保管庫','500クレジット含む','共有ワークスペース','手数料・コミッション込み - 利益設計'] }
      }
    },
    legal: { overline: '// 法律事務所向け', title: '事務所に合わせて拡張', sub: '同じエンジン', desc: '弁護士グレードAI' },
    footer: { engines: '// 16 AIエンジン — 法律事務所と同じ', terms: '利用規約', dpa: 'DPA', security: 'セキュリティ', status: 'ステータス' },
    checkout: { title: 'チェックアウト', email: 'メール', secure: 'PayPal経由の安全な決済' }
  },

  ZH: {
    code: 'ZH', flag: '🇨🇳', name: '中文',
    common: { brand: 'LEXAI.LLC', business: '商业', legal: '法律', login: '登录', start: '开始', cancelAnytime: '随时取消', noTrials: '无试用 — 固定价格含手续费和佣金', cheaperThanNDA: '比一份NDA便宜 • 律师 $350/小时 vs $49', poweredBy: '© {year} LEXAI.LLC — 商业定价', soc: 'SOC 2 • 加密保险库 • 99.9%正常运行时间', vaultSecure: '加密保险库 • soc-2 • dpa就绪' },
    nav: { business: '商业', legal: '法律', pricing: '定价', login: '登录', dashboard: '仪表板' },
    business: {
      overline: '// 商业定价',
      title: '随业务扩展的定价',
      sub: '律师以$1,500/月使用的相同引擎。',
      desc: '商业级法律AI。16个引擎，共享保险库，风险评分。专为运营商打造。$49起。',
      plansLine: '计划: 基础 $49 — 单人 $150 — 大公司 $450 • 无试用',
      ndaBox: { title: '一份NDA成本: 律师 $350/小时 vs LexAI $49', desc: '基础 $49 = 比一份NDA便宜7倍。单人 $150 = 无限NDA。大公司 $450 = 5用户 = $90/用户。' },
      plans: {
        basic: { id: 'basic', code: '计划 00 / 基础', name: '基础 / 入门', badge: '获取注册', price: 49, per: '/月', pdesc: '1企业 • 50文档/月', cta: '开始基础 — $49', foot: '比一份NDA便宜 • 随时升级', features: ['1企业 - 50文档/月','核心6 - 起草到研究','2GB保险库 - 基础风险','邮件支持','随时升级到单人'] },
        solo: { id: 'solo', code: '计划 01 / 单人', name: '单人 / 中小企业', badge: '1', price: 150, per: '/月', pdesc: '$150 / 企业 • 无限文档', cta: '开始单人 — $150', foot: '适合单人运营 • 随时取消', features: ['1企业 - 无限文档','全部16 AI - 起草到ApiAccess','10GB — 风险 0-100','邮件支持 — SOC 2保险库'] },
        larger: { id: 'larger', code: '计划 02 / 大公司', name: '大公司 / 团队', badge: '最受欢迎 — $450', users: '5用户', price: 450, per: '/月', pdesc: '最多5用户 • $450总计', cta: '开始团队 — $450', foot: '5用户 • 盈利设计', features: ['最多5用户包含','单人版所有功能 +','共享保险库 + 自学习AI','优先聊天 + 50GB保险库','包含500积分','共享工作区','含手续费和佣金 - 盈利设计'] }
      }
    },
    legal: { overline: '// 律师事务所定价', title: '随事务所扩展', sub: '相同引擎', desc: '律师级AI' },
    footer: { engines: '// 16个AI引擎 — 与律所相同', terms: '条款', dpa: 'DPA', security: '安全', status: '状态' },
    checkout: { title: '结账', email: '邮箱', secure: '通过PayPal安全结账' }
  },

  KO: {
    code: 'KO', flag: '🇰🇷', name: '한국어',
    common: { brand: 'LEXAI.LLC', business: '비즈니스', legal: '법률', login: '로그인', start: '시작', cancelAnytime: '언제든지 취소 가능', noTrials: '체험 없음 — 수수료 및 커미션 포함 정액 요금', cheaperThanNDA: 'NDA 1건보다 저렴 • 변호사 $350/시간 vs $49', poweredBy: '© {year} LEXAI.LLC — 비즈니스 요금제', soc: 'SOC 2 • 암호화된 보관함 • 99.9% 가동 시간', vaultSecure: '암호화된 보관함 • soc-2 • dpa 준비' },
    nav: { business: '비즈니스', legal: '법률', pricing: '요금제', login: '로그인', dashboard: '대시보드' },
    business: {
      overline: '// 비즈니스 요금제',
      title: '비즈니스에 따라 확장되는 요금제',
      sub: '변호사가 월 $1,500에 사용하는 동일한 엔진.',
      desc: '비즈니스 등급 법률 AI. 16개 엔진, 공유 보관함, 위험 점수. 운영자를 위해 제작. $49부터 시작.',
      plansLine: '플랜: 베이직 $49 — 솔로 $150 — 대기업 $450 • 체험 없음',
      ndaBox: { title: 'NDA 1건 비용: 변호사 $350/시간 vs LexAI $49', desc: '베이직 $49 = NDA 1건보다 7배 저렴. 솔로 $150 = 무제한 NDA. 대기업 $450 = 5사용자 = $90/사용자.' },
      plans: {
        basic: { id: 'basic', code: '플랜 00 / 베이직', name: '베이직 / 스타터', badge: '가입자 확보', price: 49, per: '/월', pdesc: '1 비즈니스 • 50문서/월', cta: '베이직 시작 — $49', foot: 'NDA 1건보다 저렴 • 언제든지 업그레이드', features: ['1 비즈니스 - 50문서/월','코어 6 - 초안부터 연구까지','2GB 보관함 - 기본 위험','이메일 지원','언제든지 솔로로 업그레이드'] },
        solo: { id: 'solo', code: '플랜 01 / 솔로', name: '솔로 / 중소기업', badge: '1', price: 150, per: '/월', pdesc: '$150 / 비즈니스 • 무제한 문서', cta: '솔로 시작 — $150', foot: '솔로 운영자용 • 언제든지 취소', features: ['1 비즈니스 - 무제한 문서','전체 16 AI - 초안부터 ApiAccess','10GB — 위험 0-100','이메일 지원 — SOC 2 보관함'] },
        larger: { id: 'larger', code: '플랜 02 / 대기업', name: '대기업 / 팀', badge: '가장 인기 — $450', users: '5사용자', price: 450, per: '/월', pdesc: '최대 5사용자 • $450 합계', cta: '팀 시작 — $450', foot: '5사용자 • 수익 설계', features: ['최대 5사용자 포함','솔로의 모든 것 +','공유 보관함 + 자가 학습 AI','우선 채팅 + 50GB 보관함','500 크레딧 포함','공유 작업 공간','수수료 및 커미션 포함 - 수익 설계'] }
      }
    },
    legal: { overline: '// 로펌 요금제', title: '로펌에 따라 확장', sub: '동일한 엔진', desc: '변호사 등급 AI' },
    footer: { engines: '// 16개 AI 엔진 — 로펌과 동일', terms: '약관', dpa: 'DPA', security: '보안', status: '상태' },
    checkout: { title: '결제', email: '이메일', secure: 'PayPal을 통한 안전한 결제' }
  },

  PT: {
    code: 'PT', flag: '🇧🇷', name: 'Português',
    common: { brand: 'LEXAI.LLC', business: 'EMPRESAS', legal: 'JURÍDICO', login: 'ENTRAR', start: 'COMEÇAR', cancelAnytime: 'Cancele quando quiser', noTrials: 'Sem testes — preço fixo que cobre taxas e comissão', cheaperThanNDA: 'MAIS BARATO QUE UM NDA • Advogado $350/h vs $49', poweredBy: '© {year} LEXAI.LLC — PREÇOS EMPRESAS', soc: 'SOC 2 • COFRE CRIPTOGRAFADO • 99.9% UPTIME', vaultSecure: 'cofre-criptografado • soc-2 • dpa-pronto' },
    nav: { business: 'EMPRESAS', legal: 'JURÍDICO', pricing: 'PREÇOS', login: 'ENTRAR', dashboard: 'PAINEL' },
    business: {
      overline: '// PREÇOS PARA EMPRESAS',
      title: 'Preços que escalam com seu negócio',
      sub: 'Mesmo motor que advogados usam por $1,500/mês.',
      desc: 'IA jurídica empresarial. 16 motores, cofre compartilhado. Desde $49.',
      plansLine: 'PLANOS: BÁSICO $49 — SOLO PME $150 — EMPRESA GRANDE $450 • Sem testes',
      ndaBox: { title: 'CUSTO DE UM NDA: Advogado $350/h vs LexAI $49', desc: 'Básico $49 = 7x mais barato que um NDA. Solo $150 = NDAs ilimitados. Grande $450 = 5 usuários = $90/usuário.' },
      plans: {
        basic: { id: 'basic', code: 'PLANO 00 / BÁSICO', name: 'BÁSICO / INÍCIO', badge: 'CONSIGA CADASTROS', price: 49, per: '/mês', pdesc: '1 empresa • 50 docs/mês', cta: 'COMEÇAR BÁSICO — $49', foot: 'MAIS BARATO QUE UM NDA ($350) • UPGRADE LIVRE', features: ['1 empresa - 50 docs/mês','6 principais - Rascunho à Pesquisa','2GB cofre - Risco básico','Suporte por email','Upgrade para Solo a qualquer hora'] },
        solo: { id: 'solo', code: 'PLANO 01 / SOLO', name: 'SOLO / PME', badge: '1', price: 150, per: '/mês', pdesc: '$150 / empresa • docs ilimitados', cta: 'COMEÇAR SOLO — $150', foot: 'PARA OPERADORES SOLO • CANCELE QUANDO QUISER', features: ['1 empresa - docs ilimitados','Todos 16 IA - Rascunho a ApiAccess','10GB — Risco 0-100','Suporte — cofre SOC 2'] },
        larger: { id: 'larger', code: 'PLANO 02 / MAIOR', name: 'EMPRESA MAIOR / EQUIPE', badge: 'MAIS POPULAR — $450', users: '5 USUÁRIOS', price: 450, per: '/mês', pdesc: 'Até 5 usuários • $450 total', cta: 'COMEÇAR EQUIPE — $450', foot: '5 USUÁRIOS • LUCRATIVO POR DESIGN', features: ['Até 5 usuários incluídos','Tudo do Solo +','Cofre compartilhado + IA auto-aprendizagem','Chat prioritário + 50GB','500 créditos incluídos','Workspaces compartilhados','Cobre taxas e comissão'] }
      }
    },
    legal: { overline: '// PREÇOS PARA ESCRITÓRIOS', title: 'Preços que escalam', sub: 'Mesmo motor', desc: 'IA jurídica' },
    footer: { engines: '// 16 MOTORES IA — MESMO QUE ESCRITÓRIOS', terms: 'TERMOS', dpa: 'DPA', security: 'SEGURANÇA', status: 'STATUS' },
    checkout: { title: 'Checkout', email: 'Email', secure: 'Checkout seguro via PayPal' }
  },

  FR: {
    code: 'FR', flag: '🇫🇷', name: 'Français',
    common: { brand: 'LEXAI.LLC', business: 'ENTREPRISES', legal: 'JURIDIQUE', login: 'CONNEXION', start: 'COMMENCER', cancelAnytime: 'Annulez à tout moment', noTrials: 'Pas d\'essais — prix fixe couvrant frais et commission', cheaperThanNDA: 'MOINS CHER QU\'UN NDA • Avocat $350/h vs $49', poweredBy: '© {year} LEXAI.LLC — TARIFS ENTREPRISES', soc: 'SOC 2 • COFFRE-FORT CHIFFRÉ • 99.9% UPTIME', vaultSecure: 'coffre-chiffré • soc-2 • dpa-prêt' },
    nav: { business: 'ENTREPRISES', legal: 'JURIDIQUE', pricing: 'TARIFS', login: 'CONNEXION', dashboard: 'TABLEAU DE BORD' },
    business: {
      overline: '// TARIFS POUR ENTREPRISES',
      title: 'Des tarifs qui évoluent avec votre entreprise',
      sub: 'Même moteur que les avocats utilisent à $1,500/mois.',
      desc: 'IA juridique d\'entreprise. 16 moteurs, coffre partagé. Dès $49.',
      plansLine: 'PLANS: BASIQUE $49 — SOLO PME $150 — GRANDE ENTREPRISE $450 • Pas d\'essais',
      ndaBox: { title: 'COÛT D\'UN NDA: Avocat $350/h vs LexAI $49', desc: 'Basique $49 = 7x moins cher qu\'un NDA. Solo $150 = NDA illimités. Grande $450 = 5 utilisateurs = $90/utilisateur.' },
      plans: {
        basic: { id: 'basic', code: 'PLAN 00 / BASIQUE', name: 'BASIQUE / DÉBUT', badge: 'OBTENIR INSCRIPTIONS', price: 49, per: '/mois', pdesc: '1 entreprise • 50 docs/mois', cta: 'COMMENCER BASIQUE — $49', foot: 'MOINS CHER QU\'UN NDA ($350) • UPGRADE LIBRE', features: ['1 entreprise - 50 docs/mois','6 principaux - Brouillon à Recherche','2GB coffre - Risque basique','Support par email','Upgrade vers Solo à tout moment'] },
        solo: { id: 'solo', code: 'PLAN 01 / SOLO', name: 'SOLO / PME', badge: '1', price: 150, per: '/mois', pdesc: '$150 / entreprise • docs illimités', cta: 'COMMENCER SOLO — $150', foot: 'POUR OPÉRATEURS SOLO • ANNULEZ QUAND VOUS VOULEZ', features: ['1 entreprise - docs illimités','Tous 16 IA - Brouillon à ApiAccess','10GB — Risque 0-100','Support — coffre SOC 2'] },
        larger: { id: 'larger', code: 'PLAN 02 / PLUS GRANDE', name: 'PLUS GRANDE ENTREPRISE / ÉQUIPE', badge: 'LE PLUS POPULAIRE — $450', users: '5 UTILISATEURS', price: 450, per: '/mois', pdesc: 'Jusqu\'à 5 utilisateurs • $450 total', cta: 'COMMENCER ÉQUIPE — $450', foot: '5 UTILISATEURS • RENTABLE PAR DESIGN', features: ['Jusqu\'à 5 utilisateurs inclus','Tout dans Solo +','Coffre partagé + IA auto-apprentissage','Chat prioritaire + 50GB','500 crédits inclus','Workspaces partagés','Couvre frais et commission'] }
      }
    },
    legal: { overline: '// TARIFS POUR CABINETS', title: 'Des tarifs qui évoluent', sub: 'Même moteur', desc: 'IA juridique' },
    footer: { engines: '// 16 MOTEURS IA — MÊME QUE CABINETS', terms: 'CONDITIONS', dpa: 'DPA', security: 'SÉCURITÉ', status: 'STATUT' },
    checkout: { title: 'Paiement', email: 'Email', secure: 'Paiement sécurisé via PayPal' }
  }
};

// Helper - get translation with fallback to EN
function t(lang, path) {
  const l = (locales[lang] ? lang : 'EN');
  const keys = path.split('.');
  let cur = locales[l];
  for (const k of keys) {
    if (cur && cur[k] !== undefined) cur = cur[k];
    else { // fallback EN
      cur = locales.EN;
      for (const k2 of keys) cur = cur?.[k2];
      break;
    }
  }
  return cur;
}

function getLangFromReq(req) {
  const valid = ['EN','ES','PT','FR','JA','ZH','KO'];
  const q = (req.query?.lang || req.headers['x-lang'] || '').toString().toUpperCase();
  if (valid.includes(q)) return q;
  const cookie = (req.cookies?.lexai_lang || '').toString().toUpperCase();
  if (valid.includes(cookie)) return cookie;
  const accept = (req.headers['accept-language'] || '').toLowerCase();
  if (accept.includes('ja')) return 'JA';
  if (accept.includes('zh')) return 'ZH';
  if (accept.includes('ko')) return 'KO';
  if (accept.includes('es')) return 'ES';
  if (accept.includes('pt')) return 'PT';
  if (accept.includes('fr')) return 'FR';
  return 'EN';
}

module.exports = { locales, t, getLangFromReq, supportedLangs: ['EN','ES','PT','FR','JA','ZH','KO'] };
