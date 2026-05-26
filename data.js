// 普新精舍 60期夜間初級禪修班——結業典禮資料庫
// 透過全局變數 window.CEREMONY_DATA 供 app.js 讀取，以確保能在本地 file:// 協議下直接雙擊運作。

window.CEREMONY_DATA = {
  className: "普新精舍 60期夜間初級禪修班",
  ceremonyTitle: "結業頒證暨供燈供僧法會",
  defaultVolunteers: [
    "9位學員長",
    "吳漳(傳堅)",
    "張嘉年(法足)",
    "張燕芬(法儀)",
    "張莉玲(法絮)",
    "張雅雯(法空)",
    "曾雅蘭(傳昧)",
    "李卉羚(法本)",
    "林玲玲/法穩(第5組)",
    "林麗嬌(傳霈)",
    "江美惠(傳彿)",
    "牛靖涵(傳郁)",
    "田品萱(法印)",
    "簡維君(第4組)",
    "葉燈超(法燈)",
    "葉金鳳(法經)",
    "蔡耀文(法果)",
    "許藝娟(法慈)",
    "詹佩宜(法憫)",
    "詹瑞貞(法持)",
    "賴怡芳(法倢)",
    "賴素綿(法平)",
    "趙佳欣(法佳)",
    "邱建燁(法翱)",
    "邱黃秀枝(傳開)",
    "鄭秀美(法岫)",
    "黃品家/法敦(第5組)",
    "黃湘婷(傳麗)"
  ],
  maps: {
    map_awards: {
      name: "清淨講堂【結業頒證】",
      description: "清淨講堂平面圖，含 1-9 組座椅及頒證執事站位"
    },
    map_lamps: {
      name: "清淨講堂【傳燈與發願】",
      description: "清淨講堂傳燈與發願動線，含學員長佛前排班與移壇方向"
    },
    map_offering: {
      name: "禪堂【供燈與供僧】",
      description: "禪堂平面圖，含 144 盞摩尼寶珠燈板與供奉動線"
    }
  },
  stages: [
    {
      id: "checkin",
      title: "1. 報到與引導入座",
      time: "18:30",
      duration: "60'",
      desc: "依組別入座，清點人數，名單確認與前置作業準備。",
      notes: [
        "給【領證代表】【全勤獎】【福慧精進獎】【精進獎】【勤學獎】名單～登錄出缺席。",
        "說明豆豆貼：全勤(紅).福慧(黃).精進(綠).勤學(白)，號碼為領獎順序。擺紅包袋，提醒有供僧。",
        "引導按「座位表」入坐。"
      ],
      roles: [
        { id: "reg_absent", title: "登錄出缺席及名單發放", assignee: "賴素綿(法平)、許藝娟(法慈)", desc: "將名單登錄，並於 19:30 將最終名單交給遞證書人員，以便將未出席者證書放在下面。" },
        { id: "explain_stickers", title: "說明豆貼與提醒供僧", assignee: "曾雅蘭(傳昧)、田品萱(法印)", desc: "全勤(紅)、福慧(黃)、精進(綠)、勤學(白)，貼於學員身上，號碼為領獎順序。擺放紅包袋並提醒有供僧。" },
        { id: "guide_seats", title: "座椅座位引導", assignee: "張雅雯(法空)、鄭秀美(法岫)", desc: "引導各組學員依照座位表入座。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "reg_absent", label: "登錄名單", zone: "📄 後方走廊＆登錄區", x: 780, y: 380, align: "right" },
        { roleId: "explain_stickers", label: "說明豆貼", zone: "📄 後方走廊＆登錄區", x: 780, y: 440, align: "right" },
        { roleId: "guide_seats", label: "座位引導", zone: "🚶 中央走道", x: 450, y: 300, align: "center" }
      ]
    },
    {
      id: "rehearsal",
      title: "2. 流程預演",
      time: "19:30",
      duration: "15'",
      desc: "出班集眾、領證、領獎、供燈、供僧方式實體演練。",
      notes: [
        "教領證行儀（10分鐘內結束）：問訊 ➡ 領證書 ➡ 問訊 ➡ 證書朝外 ➡ 等其他學員東西單就位 ➡ 脫口罩 ➡ 拍照完問訊（代表持證問訊、其他問訊） ➡ 東單走師父椅後往西單歸位。",
        "全班合照時，雙手左右上下交換呈「長方形框」手勢，齊唱「照相、照相、照相.照相.照相」。"
      ],
      roles: [
        { id: "rehearse_explain", title: "預演說明", assignee: "蔡耀文(法果)", desc: "口頭說明流程行儀與動作要領。" },
        { id: "rehearse_demo", title: "預演動作示範", assignee: "學長團隊", desc: "示範問訊、領證、持證、齊唱「在哪裡」以及退場動線。" },
        { id: "weina_yuezhong", title: "維那.悅眾", assignee: "邱建燁(法翱)、吳漳(傳堅)", desc: "負責預演及典禮過程中的梵唄領唱與木魚板眼調控。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "rehearse_explain", label: "說明", zone: "🎤 台前與司儀", x: 420, y: 70, align: "left" },
        { roleId: "rehearse_demo", label: "示範學長", zone: "🎤 台前與司儀", x: 480, y: 70, align: "left" },
        { roleId: "weina_yuezhong", label: "維那.悅眾", zone: "🍖 西單邊應法區", x: 230, y: 130, align: "center" }
      ]
    },
    {
      id: "welcome",
      title: "3. 恭迎住持法師",
      time: "19:45",
      duration: "5'",
      desc: "恭迎住持法師及大眾法師入講堂陞座。",
      notes: [
        "住持法師及大眾法師由清淨講堂後方門口進出。",
        "司儀呼班起立，大眾合掌恭敬迎請。"
      ],
      roles: [
        { id: "wel_emcee", title: "司儀呼班", assignee: "詹佩宜(法憫)", desc: "主持典禮，負責呼請「恭迎住持法師、大眾法師」等號令。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "wel_emcee", label: "司儀", zone: "🎤 台前與司儀", x: 200, y: 90, align: "center" }
      ]
    },
    {
      id: "awards_grad",
      title: "4. 頒發結業證書",
      time: "19:50",
      duration: "30'",
      desc: "頒發學員、課務與學長結業證書，分組上台與住持法師合照。",
      notes: [
        "各組派一人代表領證。學員長排第1位拿舉牌(西側)，領證代表排第2位(東側)，1半學員走師父椅後到西單，另1半在東單。",
        "各組出班集眾時，大眾齊唱～「在哪裡」直到集眾結束，即立刻拉班上台。",
        "拍完照的東單學員，請走師父椅子後方，從西單前門走廊出，由後門歸位。",
        "拍照時齊唱「照相、照相、照相.照相.照相」，加左右手上下交換的「長方形框」手勢。"
      ],
      roles: [
        { id: "award_hand_cert", title: "遞證書與獎品", assignee: "林麗嬌(傳霈)、江美惠(傳彿)", desc: "由東單遞送證書＆獎品，可先放2盤在住持法師講桌上。" },
        { id: "award_pull_line", title: "中央走道拉班", assignee: "賴素綿(法平)、許藝娟(法慈)", desc: "負責中央走道拉班，拉班順序為第 1 ➡ 9 組，一組一組上台領證。" },
        { id: "award_guide_up", title: "引導上台", assignee: "葉金鳳(法經)", desc: "在講堂前方引導學員依序上台定位。" },
        { id: "award_guide_down", title: "引導下台歸位", assignee: "張雅雯(法空)", desc: "引導拍照完學員走師父椅後方，從西單前廊出，再由講堂後門歸位。" },
        { id: "award_cut_pos", title: "切班定位(拍照)", assignee: "詹瑞貞(法持)、趙佳欣(法佳)", desc: "負責舞台前方東西兩側，調整學員切班與合照定位站姿。" },
        { id: "award_check_list", title: "核對名單", assignee: "曾雅蘭(傳昧)、田品萱(法印)", desc: "現場核對出缺席與上台名單，如有缺席者，需通知遞證書人員將其證書置底。" },
        { id: "award_corridor_guide", title: "走廊引導", assignee: "張嘉年(法足)", desc: "在清淨後方及廊道引導排班的學員動線。" },
        { id: "award_emcee", title: "司儀", assignee: "詹佩宜(法憫)", desc: "呼「第X組」出班，主持典禮節奏。" },
        { id: "award_audio", title: "音響", assignee: "吳漳(傳堅)", desc: "負責播放《在哪裡》歌曲，配合拉班與拍照節奏控制音量。" },
        { id: "award_photo", title: "攝影拍照", assignee: "牛靖涵(傳郁)", desc: "負責舞台合照與現場花絮拍攝。" },
        { id: "award_light", title: "控燈", assignee: "黃湘婷(傳麗)", desc: "維持大合照時講堂最佳照明亮度。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "award_hand_cert", label: "遞證獎", zone: "🏆 台上佛前", x: 570, y: 70, align: "left" },
        { roleId: "award_pull_line", label: "中央拉班", zone: "🚶 中央走道", x: 450, y: 430, align: "right" },
        { roleId: "award_guide_up", label: "引導上台", zone: "🏆 台上佛前", x: 620, y: 110, align: "left" },
        { roleId: "award_guide_down", label: "引導歸位", zone: "🏆 台上佛前", x: 280, y: 110, align: "right" },
        { roleId: "award_cut_pos", label: "切班定位", zone: "🏆 台上佛前", x: 530, y: 95, align: "center" },
        { roleId: "award_check_list", label: "核對名單", zone: "📄 後方走廊＆登錄區", x: 770, y: 480, align: "right" },
        { roleId: "award_corridor_guide", label: "走廊引導", zone: "📄 後方走廊＆登錄區", x: 770, y: 410, align: "right" },
        { roleId: "award_emcee", label: "司儀", zone: "🎤 台前與司儀", x: 200, y: 90, align: "center" },
        { roleId: "award_audio", label: "音響", zone: "🔹 控台（西前角）", x: 120, y: 450, align: "center" },
        { roleId: "award_photo", label: "攝影", zone: "🚶 中央走道", x: 450, y: 300, align: "left" },
        { roleId: "award_light", label: "控燈", zone: "🔹 控台（西前角）", x: 120, y: 390, align: "center" }
      ]
    },
    {
      id: "awards_full",
      title: "5. 頒發全勤證書＋獎",
      time: "繼上",
      duration: "5'",
      desc: "表揚無遲到早退學員，個別上台領證與合照。",
      notes: [
        "拉班時機：領結業證書後歸位時，於清淨後方集合全勤學員排班。",
        "全勤學員依照紅色豆豆貼順序排班，個別上台領證，分 3 梯次（12~16人/梯）上台合照。"
      ],
      roles: [
        { id: "awards_full_check", title: "核對名單與拉班", assignee: "曾雅蘭(傳昧)、田品萱(法印)", desc: "在清淨後方核對紅色豆貼號碼，並引導全勤學員出班集合。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "awards_full_check", label: "全勤核對拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 220, align: "right" }
      ]
    },
    {
      id: "awards_sincere",
      title: "6. 頒發福慧精進獎",
      time: "繼上",
      duration: "5'",
      desc: "表揚缺課全部補滿且達結業標準者（實體課程10堂），個別上台領獎與合照。",
      notes: [
        "拉班時機：全勤獎領獎歸位時，於清淨後方集合福慧精進學員排班。",
        "學員依照黃色豆豆貼順序排班，個別上台領證並一起合影。"
      ],
      roles: [
        { id: "awards_sincere_check", title: "核對名單與拉班", assignee: "李卉羚(法本)、張燕芬(法儀)", desc: "在清淨後方核對黃色豆貼，引導福慧精進學員依序排班。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "awards_sincere_check", label: "福慧核對拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 220, align: "right" }
      ]
    },
    {
      id: "awards_diligence",
      title: "7. 頒發精進獎",
      time: "繼上",
      duration: "3'",
      desc: "表揚缺課補滿且已達結業標準之學員，個人上台領獎品與合照。",
      notes: [
        "學員依照綠色豆豆貼排班，個別上台領獎與合影。"
      ],
      roles: [
        { id: "awards_diligence_check", title: "核對名單與拉班", assignee: "曾雅蘭(傳昧)、田品萱(法印)", desc: "後方集合精進獎學員，核對綠色豆貼引導上台。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "awards_diligence_check", label: "精進核對拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 220, align: "right" }
      ]
    },
    {
      id: "awards_study",
      title: "8. 頒發勤學獎",
      time: "繼上",
      duration: "3'",
      desc: "表揚缺課全部補滿但未達結業標準之學員（實體課程不足10堂），個人上台領獎與合照。",
      notes: [
        "學員依照白色豆豆貼排班，個別上台領獎與合影（約15人合照）。"
      ],
      roles: [
        { id: "awards_study_check", title: "核對名單與拉班", assignee: "曾雅蘭(傳昧)、田品萱(法印)", desc: "後方集合勤學獎學員，核對白色豆貼引導上台。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "awards_study_check", label: "勤學核對拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 220, align: "right" }
      ]
    },
    {
      id: "awards_bodhi",
      title: "9. 頒發菩提獎",
      time: "繼上",
      duration: "5'",
      desc: "表揚學長團隊（總學長代表領獎）與課務團隊（課務長代表領獎），團隊一起上台合照。",
      notes: [
        "學長拉班時機：全勤頒證開始，學員長就出位排班。總學長代表領獎，全體學員長一起上台合照。",
        "課務拉班時機：全勤頒證開始，課務組就出位排班.課務長代表領獎，全體課務一起上台合照。"
      ],
      roles: [
        { id: "bodhi_pull_leader", title: "學長拉班", assignee: "張嘉年(法足)", desc: "於全勤獎頒發時，引導學員長團隊出位至講堂後方集合排班。" },
        { id: "bodhi_pull_staff", title: "課務拉班", assignee: "張莉玲(法絮)", desc: "於全勤獎頒發時，引導課務團隊出位至講堂後方集合排班。" },
        { id: "bodhi_leader_rep", title: "總學長領獎代表", assignee: "蔡耀文(法果)", desc: "代表全體學員長與學長團隊上台接受住持法師頒獎。" },
        { id: "bodhi_staff_rep", title: "課務長領獎代表", assignee: "課務長", desc: "代表全體課務團隊上台接受住持法師頒獎。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "bodhi_pull_leader", label: "學長拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 260, align: "right" },
        { roleId: "bodhi_pull_staff", label: "課務拉班", zone: "📄 後方走廊＆登錄區", x: 740, y: 300, align: "right" },
        { roleId: "bodhi_leader_rep", label: "總學長", zone: "🏆 台上佛前", x: 500, y: 70, align: "left" },
        { roleId: "bodhi_staff_rep", label: "課務長", zone: "🏆 台上佛前", x: 470, y: 70, align: "left" }
      ]
    },
    {
      id: "sharing",
      title: "10. 學員心得分享",
      time: "20:20",
      duration: "15'",
      desc: "由學員代表上台站於住持法師旁，分享心得，每人 3 分鐘 (1~2人)。",
      notes: [
        "心得分享時間限制為每人 3 分鐘。",
        "時間提醒：超過 3 分鐘敲地鐘 1 聲、超過 3.5 分鐘敲 2 聲、超過 4 分鐘敲 3 聲、超過 5 分鐘連續敲。"
      ],
      roles: [
        { id: "share_bell", title: "敲地鐘提醒", assignee: "邱建燁(法翱)", desc: "負責計時，超過 3 分鐘敲地鐘 1 聲，之後依時限加敲，提醒發言者。" },
        { id: "share_speakers", title: "心得分享代表", assignee: "簡維君(第4組)、林玲玲/法穩(第5組)、黃品家/法敦(第5組)", desc: "準備心得稿，依司儀呼班上台站於法師旁分享。每人 3 分鐘。" },
        { id: "share_mic", title: "遞無線麥克風", assignee: "鄭秀美(法岫)", desc: "負責遞送無線麥克風給分享學員，並在分享結束後收回。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "share_bell", label: "敲地鐘", zone: "🍖 西單邊應法區", x: 230, y: 130, align: "center" },
        { roleId: "share_speakers", label: "分享學員", zone: "🏆 台上佛前", x: 500, y: 70, align: "left" },
        { roleId: "share_mic", label: "遞麥人員", zone: "🎤 台前與司儀", x: 300, y: 100, align: "center" }
      ]
    },
    {
      id: "sermon",
      title: "11. 開示法要",
      time: "20:35",
      duration: "25'",
      desc: "恭請住持法師慈悲開示法要，大眾專注聆聽。",
      notes: [
        "影片播放：播放「我學佛•我分享」影片，由音響控制音頻、控燈人員關閉全場燈光。",
        "影片播放完畢後，開燈，恭請住持法師慈悲開示法要。"
      ],
      roles: [
        { id: "sermon_emcee", title: "司儀呼班", assignee: "詹佩宜(法憫)", desc: "呼班起立，問訊，恭請住持法師慈悲開示。" },
        { id: "sermon_audio", title: "音響播影片", assignee: "XXX", desc: "播放「我學佛•我分享」影片與麥克風音量調控。" },
        { id: "sermon_light", title: "控燈(影片)", assignee: "葉燈超(法燈)", desc: "播放影片時關燈，開示時恢復講堂明亮。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "sermon_emcee", label: "司儀", zone: "🎤 台前與司儀", x: 200, y: 90, align: "center" },
        { roleId: "sermon_audio", label: "音響", zone: "🔹 控台（西前角）", x: 120, y: 450, align: "center" },
        { roleId: "sermon_light", label: "控燈", zone: "🔹 控台（西前角）", x: 120, y: 390, align: "center" }
      ]
    },
    {
      id: "lamps",
      title: "12.  無盡燈 (傳燈)",
      time: "21:00",
      duration: "5'",
      desc: "傳授心燈。學員長排班接燈，將燈光傳遞給全體學員，捧燈齊唱「獻給導師」。",
      notes: [
        "待住持法師開示10分鐘後，4位翻燈執事在走道將大眾燈 (共12盤，每盤12盞，共144盞) 翻亮。",
        "開始傳燈時，控燈人員關閉場內大燈、開啟前後大門。",
        "3位遞燈托盤人員將燈車推至西單櫃前，由西單將燈托盤一一遞上舞台呈現給師父。",
        "關燈後，12位學員長在東單排成一路，上台站立接燈 (問訊 ➡ 雙手接燈盤 ➡ 問訊) 後，經中央走道回到各自組別前方，將燈光傳給學員。",
        "傳燈完成後，學員長將空托盤交給西單前遞燈人員。學員長自盤中取1盞燈，排成弧形站在佛前 (中央留空位)，面向大眾捧燈，大眾齊唱《獻給導師》。"
      ],
      roles: [
        { id: "lamp_flip", title: "翻亮大眾燈", assignee: "曾雅蘭(傳昧)、田品萱(法印)、張雅雯(法空)、鄭秀美(法岫)", desc: "在走廊快速將 12 盤大眾燈 (共 144 盞) 翻亮。" },
        { id: "lamp_control", title: "控燈人員", assignee: "葉燈超(法燈)", desc: "開始傳燈時負責關閉室內明燈、開啟大門。" },
        { id: "lamp_tray_push", title: "遞燈托盤與推車", assignee: "曾雅蘭(傳昧)、田品萱(法印)、張雅雯(法空)、鄭秀美(法岫)", desc: "清淨前門推入燈車於西單櫃前，由西單一一遞托盤上呈給師父。" },
        { id: "lamp_receiver", title: "學員長接燈傳燈", assignee: "9位學員長", desc: "東單排班上台接燈，捧回小組傳燈，最後捧1盞站在佛前 (中留空位) 帶唱。" },
        { id: "lamp_choir_lead", title: "助唱引導", assignee: "賴怡芳(法倢)", desc: "手持無線麥克風，引導及協助大眾捧燈齊唱《獻給導師》。" },
        { id: "lamp_collect_left", title: "收剩餘燈具", assignee: "詹瑞貞(法持)、趙佳欣(法佳)", desc: "將剩下的燈收於 1 盤，放置在禪堂大門內左側黑色座墊上，待補滿摩尼寶珠燈板空缺。" }
      ],
      mapId: "map_lamps",
      positions: [
        { roleId: "lamp_flip", label: "翻燈(外廊)", zone: "🚪 講堂外廊", x: 820, y: 250, align: "right" },
        { roleId: "lamp_control", label: "控燈開門", zone: "🔹 控台（西前角）", x: 120, y: 390, align: "center" },
        { roleId: "lamp_tray_push", label: "遞托盤/推車", zone: "🍖 西單邊（遞燈車）", x: 260, y: 150, align: "center" },
        { roleId: "lamp_receiver", label: "學員長佛前排班", zone: "🍖 西單邊（遞燈車）", x: 450, y: 110, align: "center" },
        { roleId: "lamp_choir_lead", label: "助唱", zone: "🍖 西單邊（遞燈車）", x: 580, y: 140, align: "left" },
        { roleId: "lamp_collect_left", label: "收剩燈(禪堂門)", zone: "🚪 禪堂門口", x: 80, y: 260, align: "left" }
      ]
    },
    {
      id: "lamps_vow",
      title: "13. 供燈發願",
      time: "21:05",
      duration: "5'",
      desc: "恭請住持法師帶領大眾宣讀發願文。",
      notes: [
        "此時，禪堂的引導、切班與示範人員應先行離場前往禪堂就位。12位學員長歸回原座位。",
        "遞經架：遞送2個發願文經架（住持法師主法經架與東單法師經架），住持法師持無線麥克風。",
        "遞師父燈：遞送 6 盞法師燈（主法 1 盞黑色四方盤，其餘大眾法師 5 盞水晶盤）。",
        "大眾全體起立，雙手捧燈，跟隨住持法師一同齊聲恭誦發願文（PPT 與螢幕顯示）。"
      ],
      roles: [
        { id: "vow_stand", title: "遞經架", assignee: "賴素綿(法平)", desc: "遞送住持法師與東單大眾法師的發願文經架。" },
        { id: "vow_monk_lamp", title: "遞大眾法師燈", assignee: "葉金鳳(法經)", desc: "遞送大眾法師水晶托盤燈具共 5 盞。" },
        { id: "vow_abbot_lamp", title: "遞住持主法燈", assignee: "賴素綿(法平)", desc: "遞送住持法師黑色四方盤燈具 1 盞。" },
        { id: "vow_mic", title: "遞麥克風", assignee: "賴素綿(法平)", desc: "協助呈遞無線麥克風給住持法師。" }
      ],
      mapId: "map_lamps",
      positions: [
        { roleId: "vow_stand", label: "遞經架", zone: "🎤 台前與司儀", x: 380, y: 70, align: "center" },
        { roleId: "vow_monk_lamp", label: "遞大眾燈", zone: "🎤 台前與司儀", x: 300, y: 70, align: "right" },
        { roleId: "vow_abbot_lamp", label: "遞主法燈", zone: "🎤 台前與司儀", x: 600, y: 70, align: "left" },
        { roleId: "vow_mic", label: "遞麥克風", zone: "🎤 台前與司儀", x: 580, y: 80, align: "left" }
      ]
    },
    {
      id: "offering",
      title: "14. 佛前供燈與供僧 (移壇禪堂)",
      time: "21:10",
      duration: "20'",
      desc: "二路移壇至禪堂。在六字大明咒聲中，依序進行佛前供燈與供僧紅包呈獻。",
      notes: [
        "拉班移壇順序：住持法師、大眾法師、總學長(右1)、副總學長(左1)、學員長、學員。隊伍形成二路，由清淨後方走廊移壇至禪堂，全程齊唱《六字大明咒》。",
        "禪堂引導動動線：學員自東單右側往後至中央走道，再往前至圓柱處切成東西單（各6位/排、共8排），學員長在第1排，面向佛龕。",
        "供燈：東西單依序上前供燈，置放於「摩尼寶珠板」圈圈上。",
        "供僧：供完燈再向前供僧，紅包放入東西單水晶盤中。供養示範：上前就位 ➡ 問訊 ➡ 至誠獻供 ➡ 問訊 ➡ 左右轉歸位，旁有義工以手勢協助。",
        "引導歸位：供奉完畢後，學員由東西兩側通道往後歸位。",
        "補燈與協助：排班人員需協助行動不便學員供燈，並在供燈結束後，使用備用燈將「摩尼寶珠板」上的 144 個空缺全部補滿。"
      ],
      roles: [
        { id: "off_pull_hall", title: "拉班至禪堂(引導)", assignee: "邱黃秀枝(傳開)", desc: "帶領隊伍二路移壇，由清淨講堂走廊有序進入禪堂。" },
        { id: "off_pull_out", title: "拉班出位", assignee: "葉金鳳(法經)", desc: "負責在講堂出口及禪堂入口維持隊伍拉班間距與速度。" },
        { id: "off_cut_east", title: "東前切班定位", assignee: "鄭秀美(法岫)", desc: "於禪堂前半段東單位置協助學員切班與定位。" },
        { id: "off_cut_west", title: "西前切班定位", assignee: "張雅雯(法空)", desc: "於禪堂前半段西單位置協助學員切班與定位。" },
        { id: "off_guide_east_post", title: "東後引導定位", assignee: "曾雅蘭(傳昧)", desc: "於禪堂後半段東側引導學員站定位置。" },
        { id: "off_guide_west_post", title: "西後引導定位", assignee: "田品萱(法印)", desc: "於禪堂後半段西側引導學員站定位置。" },
        { id: "off_demo_east", title: "東單呼班.示範手勢", assignee: "詹瑞貞(法持)", desc: "東單學員供燈供僧禮儀與手勢引導示範。" },
        { id: "off_demo_west", title: "西單呼班.示範手勢", assignee: "趙佳欣(法佳)", desc: "西單學員供燈供僧禮儀與手勢引導示範。" },
        { id: "off_refill_lamp", title: "排燈補燈與引導", assignee: "林麗嬌(傳霈)、張嘉年(法足)", desc: "引導供奉，並於最後將摩尼寶珠燈板上 144 盞燈全部補齊排好。" },
        { id: "off_collect_redbag", title: "紅包收納", assignee: "詹瑞貞(法持)、趙佳欣(法佳)", desc: "備大紙袋，在供僧結束後，將盤內紅包收齊並交予指導法師。" },
        { id: "off_control_light", title: "控燈", assignee: "黃湘婷(傳麗)", desc: "於供燈、供僧法會完畢時，開啟全場照明。" },
        { id: "off_chairs", title: "排椅/備法師椅", assignee: "張嘉年(法足)", desc: "負責禪堂內法師座椅的清點與排設（住持獅子座、大眾法師座椅 5 張）。" },
        { id: "off_card_hold", title: "大合照字卡拿取", assignee: "學員代表", desc: "大合照時，安排摩尼寶珠板最前方的六位學員負責拿 12 片大合照字卡。" }
      ],
      mapId: "map_offering",
      positions: [
        { roleId: "off_pull_hall", label: "拉班至禪堂", zone: "🚪 禪堂入口走廊", x: 450, y: 550, align: "center" },
        { roleId: "off_pull_out", label: "拉班出位", zone: "🚪 禪堂入口走廊", x: 450, y: 450, align: "center" },
        { roleId: "off_cut_east", label: "東前切班", zone: "📍 禪堂內切班定位", x: 620, y: 350, align: "left" },
        { roleId: "off_cut_west", label: "西前切班", zone: "📍 禪堂內切班定位", x: 280, y: 350, align: "right" },
        { roleId: "off_guide_east_post", label: "東後引導", zone: "📍 禪堂內切班定位", x: 650, y: 480, align: "left" },
        { roleId: "off_guide_west_post", label: "西後引導", zone: "📍 禪堂內切班定位", x: 250, y: 480, align: "right" },
        { roleId: "off_demo_east", label: "東示範", zone: "🪷 佛前供燈供僧示範", x: 550, y: 220, align: "center" },
        { roleId: "off_demo_west", label: "西示範", zone: "🪷 佛前供燈供僧示範", x: 350, y: 220, align: "center" },
        { roleId: "off_refill_lamp", label: "補燈排燈", zone: "🪷 佛前供燈供僧示範", x: 450, y: 300, align: "center" },
        { roleId: "off_collect_redbag", label: "收紅包", zone: "🪷 佛前供燈供僧示範", x: 550, y: 160, align: "left" },
        { roleId: "off_control_light", label: "控燈", zone: "🔹 控台（西前角）", x: 100, y: 480, align: "center" },
        { roleId: "off_chairs", label: "排椅備椅", zone: "🔹 控台（西前角）", x: 100, y: 160, align: "center" },
        { roleId: "off_card_hold", label: "大合照字卡", zone: "🪷 佛前供燈供僧示範", x: 450, y: 330, align: "center" }
      ]
    },
    {
      id: "farewell",
      title: "15. 恭送住持法師及大眾法師",
      time: "21:30",
      duration: "5'",
      desc: "恭送住持法師與大眾法師起駕離場，法會功德圓滿。",
      notes: [
        "大眾於禪堂後方合掌，恭送法師離場。",
        "保持肅靜，展現禪堂規矩與莊嚴。"
      ],
      roles: [
        { id: "farewell_emcee", title: "司儀呼班", assignee: "詹佩宜(法憫)", desc: "呼班「恭送住持法師、大眾法師」等指令。" }
      ],
      mapId: "map_offering",
      positions: [
        { roleId: "farewell_emcee", label: "司儀", zone: "🎤 台前與司儀", x: 200, y: 90, align: "center" }
      ]
    },
    {
      id: "announcements",
      title: "16. 法務佈達與證書發放",
      time: "繼上",
      duration: "10'",
      desc: "回到清淨講堂座位區進行近期法務宣導，並發放個人結業證書與獎品。",
      notes: [
        "法務佈達：宣宣導近期精舍法會與新禪修班開課資訊。",
        "各班發放證書：由各組學員長協助將全組個人的結業證書與全勤獎品等分發至學員手中。"
      ],
      roles: [
        { id: "ann_speaker", title: "法務佈達說明", assignee: "蔡耀文(法果)", desc: "負責宣講近期法會資訊及新班推廣事項。" },
        { id: "ann_distributor", title: "個人證書分發", assignee: "各組學員長", desc: "引導學員回座後，協助將本組結業證書、全勤獎與全勤獎品一一發放給學員。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "ann_speaker", label: "法務布達", zone: "🎤 台前與司儀", x: 420, y: 70, align: "left" },
        { roleId: "ann_distributor", label: "發放證書", zone: "🚶 中央走道", x: 450, y: 300, align: "center" }
      ]
    },
    {
      id: "cleanup",
      title: "17. 撤場與騎牛歸家",
      time: "繼上",
      duration: "20'",
      desc: "整理講堂與禪堂場地，收拾物品，分發回點，歡喜騎牛歸家。",
      notes: [
        "撤除場地佈置、清理垃圾、歸位講堂與禪堂桌椅。",
        "發放回點。"
      ],
      roles: [
        { id: "clean_up", title: "撤場與回點分發", assignee: "全體義工團隊", desc: "協助講堂與禪堂的撤場復原工作，並分發回點。" }
      ],
      mapId: "map_awards",
      positions: [
        { roleId: "clean_up", label: "回點發放撤場", zone: "📄 後方走廊＆登錄區", x: 780, y: 380, align: "right" }
      ]
    }
  ]
};

