window.I18N = {
  current: "en",
  langs: {
    en: {
      nav: { dash: "Dashboard", reg: "Register", scr: "Screening", prog: "Progress", ai: "🤖 AI Detect", diet: "🥗 Diet Plan", bmi: "⚖️ BMI Calc", calorie: "🍱 Calorie Calc" },
      ui: {
        stats: "Screening Status",
        recent: "Recent Children",
        alerts: "SAM Alerts (WHO)",
        search: "Search child...",
        filter: "All Statuses",
        who_ref: "WHO / UNICEF / POSHAN Abhiyan Guidelines"
      },
      diet: {
        sam: {
          hl: "SAM — Therapeutic Diet Protocol (WHO & POSHAN)",
          desc: "Severe Acute Malnutrition (WHO standards: Z-score < -3). Requires immediate facility-based care (NRC). Follow UNICEF protocols for RUTF.",
          c1: { t: "WHO Phase 1 (F-75)", i: ["F-75 therapeutic milk", "10-15 ml/kg per feed", "ORS/ReSoMal for hydration", "No iron in Phase 1"] },
          c2: { t: "UNICEF RUTF / Phase 2", i: ["Plumpy'Nut (UNICEF approved)", "F-100 milk transition", "200 kcal/kg/day", "Zinc & Vitamin A"] },
          c3: { t: "POSHAN Govt Support", i: ["Admit to nearest NRC", "Weekly AWC monitoring", "Cash transfer schemes", "Double ration allotment"] },
        },
        mam: {
          hl: "MAM — Supplementary Feeding (POSHAN)",
          desc: "Moderate Acute Malnutrition (Z-score -3 to -2). Manage at home with Anganwadi (AWC) Take-Home Ration (THR) and family foods.",
          c1: { t: "Energy-Dense (POSHAN THR)", i: ["AWC Energy-dense fortified blended food", "Sattu mix with jaggery (iron)", "Khichdi with ghee", "Locally sourced peanuts"] },
          c2: { t: "WHO Protein Guidelines", i: ["Eggs (highly recommended by WHO)", "Legumes/Pulses (Moong/Masoor)", "Milk/Curd daily", "Soybean/Paneer"] },
          c3: { t: "UNICEF Micronutrients", i: ["Vitamin A rich vegetables (carrots)", "Iron-rich greens (spinach)", "IFA Syrup (from ASHA)", "Vitamin C (Amla/citrus)"] },
        },
        atRisk: {
          hl: "At-Risk — Preventive Nutrition",
          desc: "Mild risk. POSHAN Abhiyan recommends dietary diversity (1000 Days focus) and hygienic wash practices (UNICEF WASH).",
          c1: { t: "POSHAN Staples", i: ["Millets (Shree Anna): Bajra/Ragi", "Rice/Roti + Dal (3x day)", "Add oil/ghee to every meal", "Suji Halwa"] },
          c2: { t: "Protective Foods", i: ["Green leafy vegetables daily", "Seasonal fruits", "Probiotic curd", "Sweet potatoes"] },
          c3: { t: "UNICEF WASH & Snacks", i: ["Wash hands before feeding", "Roasted chana with jaggery", "Clean drinking water", "Milk 2 cups/day"] },
        },
        normal: {
          hl: "Normal — Balanced Maintenance (WHO)",
          desc: "Healthy nutritional status. Follow WHO guidelines for continued breastfeeding (up to 2 yrs) and complementary feeding.",
          c1: { t: "Balanced Meals", i: ["Roti/Rice + Dal + Sabzi", "Diverse pulses weekly", "Millets included", "Seasonal fruits"] },
          c2: { t: "Growth Foods", i: ["Milk/Curd daily", "Egg/protein source daily", "Nuts and seeds", "Fish/Chicken (if non-veg)"] },
          c3: { t: "Immunity (AYUSH/POSHAN)", i: ["Haldi (Turmeric) milk", "Tulsi/Ginger during cold", "Amla for Vitamin C", "Local seasonal foods"] },
        }
      }
    },
    hi: {
      nav: { dash: "डैशबोर्ड", reg: "पंजीकरण", scr: "जांच (Screening)", prog: "प्रगति", ai: "🤖 AI जांच", diet: "🥗 आहार योजना", bmi: "⚖️ BMI गणक", calorie: "🍱 कैलोरी गणक" },
      ui: {
        stats: "पोषण स्थिति विवरण",
        recent: "हाल ही में जांचे गए बच्चे",
        alerts: "गंभीर (SAM) अलर्ट (WHO)",
        search: "बच्चे को खोजें...",
        filter: "सभी स्थितियां",
        who_ref: "WHO / UNICEF / पोषण अभियान मानक"
      },
      diet: {
        sam: {
          hl: "SAM — गंभीर कुपोषण (WHO & पोषण)",
          desc: "अति गंभीर कुपोषण (WHO मानक)। तुरंत NRC (पोषण पुनर्वास केंद्र) ले जाएं। UNICEF प्रमाणित RUTF का प्रयोग करें।",
          c1: { t: "प्राथमिक चरण (WHO F-75)", i: ["F-75 उपचारात्मक दूध", "थोड़ा-थोड़ा बार-बार दें", "ORS / ReSoMal का घोल", "शुरुआत में आयरन न दें"] },
          c2: { t: "UNICEF RUTF", i: ["प्लम्पी नट (RUTF पैकेट)", "F-100 दूध", "वजन बढ़ाने वाला आहार", "ज़िंक और विटामिन A"] },
          c3: { t: "पोषण अभियान लाभ", i: ["NRC में निःशुल्क इलाज", "आंगनवाड़ी से डबल राशन", "आर्थिक सहायता योजना", "ASHA द्वारा नियमित जांच"] },
        },
        mam: {
          hl: "MAM — मध्यम कुपोषण (POSHAN)",
          desc: "घर पर रहकर आंगनवाड़ी (Take-Home Ration) और पौष्टिक भोजन से सुधार करें।",
          c1: { t: "ऊर्जा युक्त भोजन (पोषण THR)", i: ["आंगनवाड़ी का दलिया/पंजीरी", "सत्तू और गुड़", "घी वाली खिचड़ी", "मूंगफली की चिक्की"] },
          c2: { t: "प्रोटीन (WHO सुझाव)", i: ["अण्डा (पोषण के लिए उत्तम)", "दालें (मूंग/मसूर)", "दूध और दही रोज़ाना", "सोयाबीन/पनीर"] },
          c3: { t: "UNICEF विटामिन्स", i: ["पीली/नारंगी सब्जियां (गाजर)", "हरी पत्तेदार सब्जियां", "IFA सीरप (ASHA से)", "आँवला/नींबू"] },
        },
        atRisk: {
          hl: "At-Risk — खतरे की ओर",
          desc: "पोषण अभियान के 1000 दिनों पर ध्यान दें। विविधता वाला भोजन दें और साफ-सफाई (UNICEF WASH) रखें।",
          c1: { t: "मुख्य आहार (POSHAN)", i: ["मोटा अनाज (श्री अन्न) — रागी/बाजरा", "रोटी/दाल दिन में 3 बार", "खाने में तेल/घी मिलाएं", "सूजी का हलवा"] },
          c2: { t: "सुरक्षात्मक भोजन", i: ["रोज़ हरी सब्जियां", "मौसमी फल", "दही / छाछ", "शकरकंद"] },
          c3: { t: "UNICEF WASH और स्नैक्स", i: ["खाने से पहले हाथ धोएं", "भुना चना और गुड़", "साफ पानी", "दिन में 2 बार दूध"] },
        },
        normal: {
          hl: "Normal — स्वस्थ बच्चा (WHO)",
          desc: "बच्चा स्वस्थ है। WHO के अनुसार 2 साल तक स्तनपान और पौष्टिक ऊपरी आहार जारी रखें।",
          c1: { t: "संतुलित आहार", i: ["दाल-रोटी-सब्ज़ी", "विभिन्न प्रकार की दालें", "मोटे अनाज शामिल करें", "रोज़ एक फल"] },
          c2: { t: "विकास के लिए", i: ["रोज़ दूध/दही", "अण्डा (यदि खाते हों)", "मूंगफली/मेवे", "पनीर/सोयाबीन"] },
          c3: { t: "इम्युनिटी (AYUSH/पोषण)", i: ["हल्दी वाला दूध", "सर्दी में तुलसी/अदरक", "आँवला/नींबू", "स्थानीय ताज़ा भोजन"] },
        }
      }
    },
    hinglish: {
      nav: { dash: "Dashboard", reg: "Registration", scr: "Screening", prog: "Progress", ai: "🤖 AI Detect", diet: "🥗 Diet Plan", bmi: "⚖️ BMI Calculator", calorie: "🍱 Calorie Calc" },
      ui: {
        stats: "Poshan Status Summary",
        recent: "Recent Bachhe",
        alerts: "SAM Alerts (WHO)",
        search: "Bachcha search karein...",
        filter: "All Statuses",
        who_ref: "WHO / UNICEF / Poshan Abhiyan Guidelines"
      },
      diet: {
        sam: {
          hl: "SAM — Gambhir Kuposhan (WHO & POSHAN)",
          desc: "Severe Acute Malnutrition. Turant NRC (Nutrition Rehab Centre) le jayein. UNICEF approved RUTF use karein.",
          c1: { t: "WHO Phase 1 (F-75)", i: ["F-75 therapeutic milk", "Har 2 ghante mein dein", "ORS/ReSoMal for hydration", "No iron initially"] },
          c2: { t: "UNICEF RUTF", i: ["Plumpy'Nut sachets", "F-100 milk", "High calorie diet", "Zinc & Vitamin A"] },
          c3: { t: "Poshan Abhiyan Benefits", i: ["NRC admission", "Anganwadi double ration", "Cash transfer schemes", "ASHA regular vitis"] },
        },
        mam: {
          hl: "MAM — Moderate Kuposhan (POSHAN)",
          desc: "Ghar par Anganwadi ka THR (Take-Home Ration) aur healthy family food se theek karein.",
          c1: { t: "Energy Food (Poshan THR)", i: ["AWC panjiri/daliya", "Sattu aur gud", "Khichdi with ghee", "Moongphali chikki"] },
          c2: { t: "Protein (WHO guidelines)", i: ["Eggs (highly recommended)", "Daal (Moong/Masoor)", "Doodh/Dahi daily", "Soyabean"] },
          c3: { t: "UNICEF Micronutrients", i: ["Yellow/Orange veggies", "Green leafy spinach/palak", "IFA Syrup from ASHA", "Amla/Nimbu"] },
        },
        atRisk: {
          hl: "At-Risk — Khatre ki or",
          desc: "Poshan Abhiyan First 1000 Days focus karein. Diet diversity badhayein aur hygiene (UNICEF WASH) rakhein.",
          c1: { t: "Main Diet (POSHAN)", i: ["Millets (Shree Anna) - Ragi", "Roti/Daal 3 times a day", "Add 1 spoon oil/ghee", "Suji Halwa"] },
          c2: { t: "Protective Food", i: ["Hari sabziyaan roz", "Seasonal fruits", "Dahi/Chaach", "Sweet potato"] },
          c3: { t: "UNICEF WASH & Snacks", i: ["Khaane se pehle haath dhoye", "Bhuna chana + Gud", "Clean boiled water", "2 glass doodh"] },
        },
        normal: {
          hl: "Normal — Healthy Child (WHO)",
          desc: "Bachcha healthy hai. WHO guidelines ke hisaab se 2 saal tak mother's milk aur upri aahar continue rakhein.",
          c1: { t: "Balanced Diet", i: ["Daal-Roti-Sabzi", "Variety of pulses", "Millets/Mota anaj", "1 fruit daily"] },
          c2: { t: "Growth Foods", i: ["Doodh aur Dahi", "Egg/Protein daily", "Nuts aur seeds", "Paneer"] },
          c3: { t: "Immunity (AYUSH/POSHAN)", i: ["Haldi doodh at night", "Tulsi/Adrak for cold", "Amla for immunity", "Local fresh food"] },
        }
      }
    },
    bn: {
      nav: { dash: "ড্যাশবোর্ড", reg: "নিবন্ধন", scr: "স্ক্রিনিং", prog: "অগ্রগতি", ai: "🤖 এআই সনাক্তকরণ", diet: "🥗 খাদ্য তালিকা" },
      ui: {
        stats: "পুষ্টির স্থিতি",
        recent: "সাম্প্রতিক শিশু",
        alerts: "SAM সতর্কতা (WHO)",
        search: "শিশু খুঁজুন...",
        filter: "সব স্থিতি",
        who_ref: "WHO / UNICEF / পোষণ অভিযান নির্দেশিকা"
      },
      diet: {
        sam: {
          hl: "SAM — গুরুতর অপুষ্টি (WHO & POSHAN)",
          desc: "অবিলম্বে NRC কেন্দ্রে নিয়ে যান। UNICEF অনুমোদিত RUTF ব্যবহার করুন।",
          c1: { t: "প্রাথমিক পর্যায় (WHO F-75)", i: ["F-75 থেরাপিউটিক দুধ", "একটু একটু করে খাওয়ান", "ORS / ReSoMal", "লৌহ (Iron) দেবেন না"] },
          c2: { t: "UNICEF RUTF", i: ["RUTF প্যাকেট", "F-100 দুধ", "উচ্চ ক্যালোরিযুক্ত খাবার", "জিঙ্ক এবং ভিটামিন এ"] },
          c3: { t: "সরকারী সহায়তা (POSHAN)", i: ["NRC-তে বিনামূল্যের চিকিৎসা", "অঙ্গনওয়াড়ি ডবল রেশন", "আর্থিক সহায়তা", "ASHA পর্যবেক্ষণ"] },
        },
        mam: {
          hl: "MAM — মাঝারি অপুষ্টি (POSHAN)",
          desc: "অঙ্গনওয়াড়ি (AWC) থেকে দেওয়া রেশন এবং বাড়িতে পুষ্টিকর খাবার দিয়ে চিকিৎসা করুন।",
          c1: { t: "শক্তিদায়ক খাবার", i: ["AWC এর পুষ্টিকর ছাতু", "গুড় ও ছাতু", "ঘি দিয়ে খিচুড়ি", "চিনাবাদাম"] },
          c2: { t: "প্রোটিন (WHO)", i: ["ডিম", "ডাল (মুগ/মসুর)", "দুধ ও দই", "সয়াবিন"] },
          c3: { t: "ভিটামিন (UNICEF)", i: ["গাজর, পেঁপে", "সবুজ শাকসবজি", "IFA সিরাপ", "আমলা/লেবু"] },
        },
        atRisk: {
          hl: "At-Risk — ঝুঁকির মধ্যে",
          desc: "পোষণ অভিযানের 1000 দিনের দিকে লক্ষ্য রাখুন। পরিচ্ছন্নতা (UNICEF WASH) বজায় রাখুন।",
          c1: { t: "প্রধান খাবার", i: ["বাজরা / রাগি", "ডাল-ভাত 3 বার", "খাবারে তেল/ঘি যোগ করুন", "সুজির হালুয়া"] },
          c2: { t: "প্রতিরক্ষামূলক খাবার", i: ["প্রতিদিন সবুজ শাক", "মরসুমী ফাল", "দই", "মিষ্টি আলু"] },
          c3: { t: "পরিচ্ছন্নতা ও স্ন্যাকস", i: ["খাওয়ার আগে হাত ধোওয়া", "ভাজা ছোলা ও গুড়", "পরিষ্কার জল", "দুধ"] },
        },
        normal: {
          hl: "Normal — সুস্থ শিশু (WHO)",
          desc: "শিশু সুস্থ। WHO এর নিয়ম অনুযায়ী 2 বছর পর্যন্ত বুকের দুধ খাওয়ান।",
          c1: { t: "সুষম খাবার", i: ["ডাল-ভাত-সবজি", "নানা রকম ডাল", "বাজরা", "রোজ একটু ফল"] },
          c2: { t: "বৃদ্ধির জন্য", i: ["দুধ/দই", "ডিম বা পনির", "বাদাম", "মাছ (অতিরিক্ত)"] },
          c3: { t: "রোগ প্রতিরোধ (AYUSH)", i: ["হলুদ দুধ", "তুলসী/আদা", "আমলা", "তাজা খাবার"] },
        }
      }
    },
    te: {
      nav: { dash: "డాష్‌బోర్డ్", reg: "నమోదు", scr: "స్క్రీనింగ్", prog: "పురోగతి", ai: "🤖 AI గుర్తింపు", diet: "🥗 ఆహార ప్రణాళిక" },
      ui: {
        stats: "స్క్రీనింగ్ స్థితి",
        recent: "ఇటీవలి పిల్లలు",
        alerts: "SAM హెచ్చరికలు (WHO)",
        search: "పిల్లల కోసం శోధించండి...",
        filter: "అన్ని స్థితులు",
        who_ref: "WHO / UNICEF / పోషన్ అభియాన్ మార్గదర్శకాలు"
      },
      diet: {
        sam: {
          hl: "SAM — తీవ్రమైన పోషకాహార లోపం (WHO & POSHAN)",
          desc: "వెంటనే NRC కేంద్రానికి తీసుకెళ్లండి. UNICEF ఆమోదించిన RUTF ఉపయోగించండి.",
          c1: { t: "ప్రాథమిక దశ (WHO)", i: ["F-75 పాలు", "చిన్నమొత్తంలో ఇవ్వండి", "ORS / ReSoMal", "ఐరన్ ఇవ్వకండి"] },
          c2: { t: "UNICEF RUTF", i: ["Plumpy'Nut RUTF", "F-100 పాలు", "అధిక క్యాలరీల ఆహారం", "జింక్ కలుపుకొని"] },
          c3: { t: "ప్రభుత్వ మద్దతు", i: ["NRC చికిత్స", "అంగన్‌వాడీ రేషన్", "ఆర్థిక సహాయం", "ASHA పర్యవేక్షణ"] },
        },
        mam: {
          hl: "MAM — మితమైన పోషకాహార లోపం (POSHAN)",
          desc: "అంగన్‌వాడీ మరియు ఇంటి ఆహారంతో ఇంట్లోనే నిర్వహించండి.",
          c1: { t: "శక్తినిచ్చే ఆహారం", i: ["అంగన్‌వాడీ రేషన్", "సత్తు + బెల్లం", "నెయ్యి కిచిడీ", "వేరుశెనగలు"] },
          c2: { t: "ప్రోటీన్ (WHO మార్గదర్శకాలు)", i: ["గుడ్డు", "పప్పులు", "పాలు, పెరుగు", "సోయాబీన్"] },
          c3: { t: "విటమిన్లు (UNICEF)", i: ["బీటా కెరోటిన్ కూరగాయలు", "ఆకుకూరలు", "IFA సిరప్", "ఉసిరి/నిమ్మకాయ"] },
        },
        atRisk: {
          hl: "At-Risk — ప్రమాదంలో",
          desc: "1000 రోజుల పోషన్ అభియాన్ దృష్టి కేంద్రీకరించండి.",
          c1: { t: "ప్రధాన ఆహారం", i: ["రాగులు/సజ్జలు", "అన్నం+పప్పు 3 సార్లు", "నెయ్యి/నూనె జోడించండి", "సూజీ హల్వా"] },
          c2: { t: "రక్షిత ఆహారం", i: ["ఆకుకూరలు", "సీజనల్ పండ్లు", "పెరుగు", "చిలగడదుంప"] },
          c3: { t: "పరిశుభ్రత (WASH)", i: ["చేతులు కడుక్కోవడం", "వేరుశెనగ పట్టీ", "సురక్షిత త్రాగునీరు", "పాలు"] },
        },
        normal: {
          hl: "Normal — ఆరోగ్యకరమైన బిడ్డ (WHO)",
          desc: "బిడ్డ ఆరోగ్యంగా ఉన్నాడు. WHO ప్రకారం 2 సంవత్సరాల వరకు తల్లిపాలు కొనసాగించండి.",
          c1: { t: "సమతుల్య ఆహారం", i: ["అన్నం/రోటీ, పప్పు, కూర", "వివిధ పప్పులు", "చిరుధాన్యాలు", "రోజూ 1 పండు"] },
          c2: { t: "పెరుగుదల కోసం ఆహారం", i: ["పాలు/పెరుగు", "గుడ్డు/కూరగాయల ప్రోటీన్", "గింజలు", "పనీర్/మాంసం"] },
          c3: { t: "రోగనిరోధక శక్తి (AYUSH)", i: ["పసుపు పాలు", "తులసి, అల్లం", "ఉసిరి", "తాజా ఆహారం"] },
        }
      }
    },
    // Fallbacks for mapping the rest 10 languages functionally
    mr: { nav: { dash: "डॅशबोर्ड", reg: "नोंदणी", scr: "तपासणी", prog: "प्रगती", ai: "🤖 AI तपासणी", diet: "🥗 आहार योजना" }, ui: { stats: "तपासणी स्थिती", search: "शोधा...", who_ref: "WHO / UNICEF / पोषण अभियान" }, diet: { sam: { hl: "गंभीर कुपोषण (WHO)" }, mam: { hl: "मध्यम कुपोषण (POSHAN)" }, atRisk: { hl: "धोका" }, normal: { hl: "सामान्य" } } },
    ta: { nav: { dash: "கட்டுப்பாட்டகம்", reg: "பதிவு", scr: "பரிசோதனை", prog: "முன்னேற்றம்", ai: "🤖 AI கண்டறிதல்", diet: "🥗 உணவு திட்டம்" }, ui: { stats: "நிலை", search: "தேடு...", who_ref: "WHO / UNICEF / POSHAN" }, diet: { sam: { hl: "கடுமையான ஊட்டச்சத்துக் குறைபாடு" }, mam: { hl: "மிதமான ஊட்டச்சத்துக் குறைபாடு" }, atRisk: { hl: "ஆபத்து" }, normal: { hl: "சாதாரண" } } },
    gu: { nav: { dash: "ડેશબોર્ડ", reg: "નોંધણી", scr: "તપાસ", prog: "પ્રગતિ", ai: "🤖 AI તપાસ", diet: "🥗 આહાર યોજના" }, ui: { stats: "સ્થિતિ", search: "શોધ...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "અતિ ગંભીર કુપોષણ" }, mam: { hl: "મધ્યમ કુપોષણ" }, atRisk: { hl: "જોખમ" }, normal: { hl: "સામાન્ય" } } },
    ur: { nav: { dash: "ڈیش بورڈ", reg: "رجسٹریشن", scr: "بیماری کی سکریننگ", prog: "ترقی", ai: "🤖 AI سکریننگ", diet: "🥗 خوراک کا منصوبہ" }, ui: { stats: "سٹیٹس", search: "تلاش کریں...", who_ref: "WHO / UNICEF / Poshan" }, diet: { sam: { hl: "شدید غذائی قلت" }, mam: { hl: "معتدل غذائی قلت" }, atRisk: { hl: "خطرے میں" }, normal: { hl: "نارمل" } } },
    kn: { nav: { dash: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", reg: "ನೋಂದಣಿ", scr: "ಪರಿಶೀಲನೆ", prog: "ಪ್ರಗತಿ", ai: "🤖 AI ಪತ್ತೆ", diet: "🥗 ಆಹಾರ ಯೋಜನೆ" }, ui: { stats: "ಸ್ಥಿತಿ", search: "ಹುಡುಕು...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "ತೀವ್ರ ಅಪೌಷ್ಟಿಕತೆ" }, mam: { hl: "ಸಾಧಾರಣ ಅಪೌಷ್ಟಿಕತೆ" }, atRisk: { hl: "ಅಪಾಯದಲ್ಲಿ" }, normal: { hl: "ಸಾಮಾನ್ಯ" } } },
    ml: { nav: { dash: "ഡാഷ്‌ബോർഡ്", reg: "രജിസ്റ്റർ", scr: "സ്ക്രീനിംഗ്", prog: "പുരോഗതി", ai: "🤖 AI കണ്ടെത്തൽ", diet: "🥗 ഡയറ്റ് പ്ലാൻ" }, ui: { stats: "സ്റ്റാറ്റസ്", search: "തിരയുക...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "കടുത്ത പോഷകാഹാരക്കുറവ്" }, mam: { hl: "മിതമായ പോഷകാഹാരക്കുറവ്" }, atRisk: { hl: "അപകടസാധ്യത" }, normal: { hl: "സാധാരണ" } } },
    or: { nav: { dash: "ଡ୍ୟାସବୋର୍ଡ", reg: "ପଞ୍ଜିକରଣ", scr: "ସ୍କ୍ରିନିଂ", prog: "ପ୍ରଗତି", ai: "🤖 AI ଯାଞ୍ଚ", diet: "🥗 ଡାଏଟ୍ ପ୍ଲାନ୍" }, ui: { stats: "ସ୍ଥିତି", search: "ସନ୍ଧାନ କରନ୍ତୁ...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "ଗୁରୁତର ପୁଷ୍ଟିହୀନତା" }, mam: { hl: "ମଧ୍ୟମ ପୁଷ୍ଟିହୀନତା" }, atRisk: { hl: "ବିପଦରେ" }, normal: { hl: "ସାଧାରଣ" } } },
    pa: { nav: { dash: "ਡੈਸ਼ਬੋਰਡ", reg: "ਰਜਿਸਟਰ", scr: "ਸਕ੍ਰੀਨਿੰਗ", prog: "ਤਰੱਕੀ", ai: "🤖 AI ਜਾਂਚ", diet: "🥗 ਖੁਰਾਕ ਯੋਜਨਾ" }, ui: { stats: "ਸਥਿਤੀ", search: "ਖੋਜੋ...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "ਗੰਭੀਰ ਕੁਪੋਸ਼ਣ" }, mam: { hl: "ਵਿਚਕਾਰਲਾ ਕੁਪੋਸ਼ਣ" }, atRisk: { hl: "ਖਤਰੇ ਵਿੱਚ" }, normal: { hl: "ਆਮ" } } },
    as: { nav: { dash: "ডেশবৰ্ড", reg: "পঞ্জীয়ন", scr: "পৰীক্ষা", prog: "প্ৰগতি", ai: "🤖 AI চিনাক্তকৰণ", diet: "🥗 খাদ্য পৰিকল্পনা" }, ui: { stats: "স্থিতি", search: "সন্ধান কৰক...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "গুৰুতৰ অপুষ্টি" }, mam: { hl: "সাধাৰণ অপুষ্টি" }, atRisk: { hl: "বিপদত" }, normal: { hl: "স্বাভাৱিক" } } },
    mai: { nav: { dash: "डैशबोर्ड", reg: "पंजीकरण", scr: "जांच", prog: "प्रगति", ai: "🤖 AI जांच", diet: "🥗 आहार योजना" }, ui: { stats: "स्थिति", search: "खोजू...", who_ref: "WHO / UNICEF" }, diet: { sam: { hl: "गंभीर कुपोषण" }, mam: { hl: "मध्यम कुपोषण" }, atRisk: { hl: "खतरा" }, normal: { hl: "सामान्य" } } },
    sa: { nav: { dash: "नियन्त्रणपट्टिका", reg: "पञ्जीकरणम्", scr: "परीक्षणम्", prog: "प्रगतिः", ai: "🤖 AI परीक्षणम्", diet: "🥗 आहारयोजना" }, ui: { stats: "स्थितिः", search: "अन्वेषणम्...", who_ref: "WHO / UNICEF / पोषण" }, diet: { sam: { hl: "गम्भीर कुपोषणम्" }, mam: { hl: "मध्यम कुपोषणम्" }, atRisk: { hl: "सङ्कटः" }, normal: { hl: "सामान्य" } } }
  }
};
