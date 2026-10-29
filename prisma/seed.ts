// Seeds subjects + the 8 Fahm packages. Lesson content comes from `library` (sample lessons, regrouped per package).
// Existing courses are left untouched so re-running never wipes student progress. Run: npm run db:seed
import pkg from "@prisma/client";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import type { Question } from "../src/lib/grading.ts";

const { PrismaClient } = pkg;
const db = new PrismaClient();

type L = { title: string; minutes: number; body: string; summary?: string; preview?: boolean; exercise?: Question[] };
type C = {
  slug: string; title: string; subtitle: string; description: string; keywords: string; subject: "math" | "english";
  level: string; difficulty: string; type: string; price?: number; salePrice?: number; glyph: string; daysAgo: number;
  billing?: "ONCE" | "MONTHLY" | "HOURLY"; months?: number; days?: number; hours?: number;
  objectives: string[]; prerequisites: string[]; faqs?: { q: string; a: string }[]; sections: { title: string; lessons: L[] }[];
};

const subjects = [
  { slug: "math", nameAr: "الرياضيات", nameEn: "Mathematics", order: 1, blurbAr: "ابنِ ثقتك بالأرقام عبر شرح واضح وتمارين متدرّجة." },
  { slug: "english", nameAr: "اللغة الإنجليزية", nameEn: "English", order: 2, blurbAr: "مفردات وقواعد ونطق واستماع ومحادثة، خطوة بخطوة." },
];

const library: C[] = [
  {
    slug: "math-basics", title: "أساسيات الرياضيات", subtitle: "للمبتدئين", glyph: "1 2 3", daysAgo: 90,
    description: "نبدأ من الأعداد ومنازلها، ثم نتعلم المقارنة والأنماط العددية، بأسلوب بسيط يناسب من يبدأ رحلته مع الرياضيات.",
    keywords: "numbers place value أعداد منازل مقارنة أنماط", subject: "math", level: "PRIMARY", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["قراءة الأعداد حتى 1000 وكتابتها", "تحديد قيمة الرقم حسب منزلته", "المقارنة بين الأعداد باستخدام < و >", "اكتشاف الأنماط العددية البسيطة"],
    prerequisites: ["معرفة العدّ حتى 100"],
    sections: [
      { title: "الأعداد ومنازلها", lessons: [
        { title: "الأعداد من 1 إلى 1000", minutes: 8, preview: true, summary: "الآحاد والعشرات والمئات.",
          body: "كل رقم في العدد له منزلة تحدد قيمته. في العدد 352: الرقم 2 في منزلة الآحاد، والرقم 5 في منزلة العشرات وقيمته 50، والرقم 3 في منزلة المئات وقيمته 300.\n\nيمكننا كتابة العدد بالصيغة الممتدة: $352 = 300 + 50 + 2$." },
        { title: "المقارنة بين الأعداد", minutes: 7, summary: "استخدام الرموز < و > و =.",
          body: "للمقارنة بين عددين نبدأ من المنزلة الكبرى. لمقارنة 452 و 425: المئات متساوية (4)، ثم ننظر إلى العشرات: 5 أكبر من 2، إذن $452 > 425$.\n\nتذكّر: فتحة الرمز تتجه دائمًا نحو العدد الأكبر." },
      ] },
      { title: "الأنماط والتدريب", lessons: [
        { title: "الأنماط العددية", minutes: 6, summary: "اكتشف القاعدة وأكمل النمط.",
          body: "النمط العددي سلسلة أعداد تتبع قاعدة ثابتة. في النمط 5، 10، 15، 20 نضيف 5 في كل خطوة، فيكون العدد التالي 25.\n\nابحث دائمًا عن الفرق بين كل عددين متتاليين." },
        { title: "تمرين: الأعداد والمنازل", minutes: 10, summary: "اختبر فهمك للمنازل والمقارنة والأنماط.", body: "أجب عن الأسئلة التالية، ويمكنك طلب تلميح عند الحاجة.",
          exercise: [
            { type: "mcq", prompt: "ما قيمة الرقم 7 في العدد 472؟", choices: ["7", "70", "700"], answer: 1, hint: "الرقم 7 في منزلة العشرات.", steps: ["الآحاد: 2", "العشرات: 7، وقيمته $7 \\times 10 = 70$"] },
            { type: "mcq", prompt: "أي مقارنة صحيحة؟", choices: ["$318 > 381$", "$318 < 381$", "$318 = 381$"], answer: 1, hint: "قارن العشرات بعد أن تتساوى المئات." },
            { type: "numeric", prompt: "أكمل النمط: 3، 6، 9، 12، ...", answer: 15, hint: "ما الفرق بين كل عددين؟", steps: ["الفرق ثابت ويساوي 3", "$12 + 3 = 15$"] },
          ] },
      ] },
    ],
  },
  {
    slug: "arithmetic-step-by-step", title: "العمليات الحسابية", subtitle: "تعلّم خطوة بخطوة", glyph: "+ − × ÷", daysAgo: 80,
    description: "الجمع والطرح والضرب والقسمة بشرح مرئي متدرّج، مع أمثلة محلولة تساعدك على فهم سبب كل خطوة لا حفظها فقط.",
    keywords: "addition subtraction multiplication division جمع طرح ضرب قسمة جدول الضرب", subject: "math", level: "PRIMARY", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["الجمع والطرح مع إعادة التجميع", "فهم الضرب كجمع متكرر", "ربط القسمة بالضرب", "حل مسائل كلامية بسيطة"],
    prerequisites: ["قراءة الأعداد حتى 1000"],
    sections: [
      { title: "الجمع والطرح", lessons: [
        { title: "الجمع مع إعادة التجميع", minutes: 9, preview: true, summary: "عندما يتجاوز مجموع الآحاد 9.",
          body: "عند جمع $47 + 38$ نبدأ بالآحاد: $7 + 8 = 15$، نكتب 5 وننقل 1 إلى العشرات.\n\nثم العشرات: $4 + 3 + 1 = 8$. الناتج: $85$." },
        { title: "الطرح مع الاستلاف", minutes: 9, summary: "عندما يكون رقم الآحاد أصغر.",
          body: "في $52 - 17$ لا نستطيع طرح 7 من 2، فنستلف عشرة من العشرات فتصبح الآحاد 12 والعشرات 4.\n\n$12 - 7 = 5$ و $4 - 1 = 3$، إذن الناتج $35$." },
      ] },
      { title: "الضرب والقسمة", lessons: [
        { title: "معنى الضرب", minutes: 8, summary: "الضرب جمع متكرر.",
          body: "$4 \\times 3$ تعني أربع مجموعات في كل منها 3: $3 + 3 + 3 + 3 = 12$.\n\nالضرب عملية تبديلية: $4 \\times 3 = 3 \\times 4$." },
        { title: "القسمة عكس الضرب", minutes: 8, summary: "استخدم جدول الضرب لتقسم.",
          body: "$20 \\div 4$ تسأل: كم مرة يتكرر 4 ليصبح 20؟ بما أن $4 \\times 5 = 20$ فإن $20 \\div 4 = 5$." },
        { title: "تمرين: العمليات الأربع", minutes: 12, summary: "مسائل متنوعة مع حلول خطوة بخطوة.", body: "حل المسائل التالية. اكتب الناتج بالأرقام.",
          exercise: [
            { type: "numeric", prompt: "احسب $68 + 25$", answer: 93, hint: "ابدأ بالآحاد: $8 + 5$", steps: ["$8 + 5 = 13$، نكتب 3 وننقل 1", "$6 + 2 + 1 = 9$", "الناتج $93$"] },
            { type: "numeric", prompt: "احسب $73 - 48$", answer: 25, hint: "ستحتاج إلى الاستلاف.", steps: ["نستلف: $13 - 8 = 5$", "$6 - 4 = 2$", "الناتج $25$"] },
            { type: "mcq", prompt: "مع سارة 6 علب، في كل علبة 4 أقلام. كم قلمًا معها؟", choices: ["10", "24", "20"], answer: 1, steps: ["$6 \\times 4 = 24$"] },
            { type: "numeric", prompt: "احسب $36 \\div 9$", answer: 4, hint: "ما العدد الذي إذا ضربناه في 9 أعطى 36؟" },
          ] },
      ] },
    ],
  },
  {
    slug: "fractions-and-decimals", title: "الكسور والأعداد العشرية", subtitle: "من الفهم إلى الإتقان", glyph: "½ 0.5", daysAgo: 60,
    description: "افهم معنى الكسر، وتعرّف على الكسور المتكافئة، وتعلّم جمع الكسور وتحويلها إلى أعداد عشرية مع تمارين تفاعلية.",
    keywords: "fractions decimals كسور كسر عشرية بسط مقام", subject: "math", level: "PRIMARY", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["تمثيل الكسور وفهم البسط والمقام", "إيجاد الكسور المتكافئة", "جمع كسور لها المقام نفسه", "التحويل بين الكسور والأعداد العشرية"],
    prerequisites: ["إتقان الضرب والقسمة"],
    sections: [
      { title: "الكسور", lessons: [
        { title: "ما هو الكسر؟", minutes: 7, preview: true, summary: "البسط والمقام.",
          body: "الكسر $\\frac{3}{4}$ يعني أننا قسمنا الشيء إلى 4 أجزاء متساوية وأخذنا 3 منها.\n\nالعدد العلوي (3) هو البسط، والعدد السفلي (4) هو المقام." },
        { title: "الكسور المتكافئة", minutes: 8, summary: "كسور مختلفة الشكل متساوية القيمة.",
          body: "إذا ضربنا البسط والمقام في العدد نفسه نحصل على كسر مكافئ: $\\frac{1}{2} = \\frac{2}{4} = \\frac{4}{8}$.\n\nوللتبسيط نقسم البسط والمقام على عامل مشترك: $\\frac{6}{9} = \\frac{2}{3}$." },
        { title: "جمع الكسور", minutes: 9, summary: "عندما تتساوى المقامات.",
          body: "عند تساوي المقامات نجمع البسوط ونُبقي المقام: $\\frac{1}{5} + \\frac{2}{5} = \\frac{3}{5}$." },
      ] },
      { title: "الأعداد العشرية", lessons: [
        { title: "من الكسر إلى العدد العشري", minutes: 8, summary: "الأجزاء من عشرة ومن مئة.",
          body: "$\\frac{1}{10} = 0.1$ و $\\frac{25}{100} = 0.25$.\n\nلتحويل $\\frac{1}{2}$ نجعل مقامه 10: $\\frac{1}{2} = \\frac{5}{10} = 0.5$." },
        { title: "تمرين: الكسور والعشريات", minutes: 12, summary: "يمكنك كتابة الإجابة كسرًا مثل 3/4 أو عددًا عشريًا.", body: "أجب عن الأسئلة. في الأسئلة العددية يمكنك كتابة $3/4$ أو $0.75$.",
          exercise: [
            { type: "mcq", prompt: "أي كسر يكافئ $\\frac{2}{3}$؟", choices: ["$\\frac{4}{6}$", "$\\frac{3}{4}$", "$\\frac{2}{6}$"], answer: 0, hint: "اضرب البسط والمقام في 2.", steps: ["$\\frac{2 \\times 2}{3 \\times 2} = \\frac{4}{6}$"] },
            { type: "numeric", prompt: "احسب $\\frac{2}{7} + \\frac{3}{7}$", answer: 5 / 7, tolerance: 0.001, hint: "المقامات متساوية.", steps: ["نجمع البسوط: $2 + 3 = 5$", "الناتج $\\frac{5}{7}$"] },
            { type: "numeric", prompt: "اكتب $\\frac{3}{4}$ عددًا عشريًا", answer: 0.75, hint: "اجعل المقام 100.", steps: ["$\\frac{3}{4} = \\frac{75}{100}$", "$= 0.75$"] },
          ] },
      ] },
    ],
  },
  {
    slug: "algebra-and-equations", title: "الجبر والمعادلات", subtitle: "افهم المجهول", glyph: "x + 3 = 7", daysAgo: 45,
    description: "مدخل واضح إلى الجبر: المتغيرات والعبارات الجبرية، ثم حل المعادلات من خطوة واحدة ومن خطوتين مع التحقق من الحل.",
    keywords: "algebra equations variables جبر معادلة متغير مجهول", subject: "math", level: "MIDDLE", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["فهم المتغير والعبارة الجبرية", "تبسيط العبارات بجمع الحدود المتشابهة", "حل معادلات من خطوة وخطوتين", "التحقق من صحة الحل"],
    prerequisites: ["العمليات الأربع", "الأعداد السالبة (مستحسن)"],
    sections: [
      { title: "المتغيرات والعبارات", lessons: [
        { title: "ما هو المتغير؟", minutes: 7, preview: true, summary: "حرف يمثل عددًا مجهولًا.",
          body: "المتغير رمز مثل $x$ يمثل عددًا لا نعرفه بعد. العبارة $x + 4$ تعني «عددًا ما مضافًا إليه 4».\n\nإذا كان $x = 6$ فإن $x + 4 = 10$." },
        { title: "تبسيط العبارات الجبرية", minutes: 9, summary: "جمع الحدود المتشابهة.",
          body: "الحدود المتشابهة لها المتغير نفسه: $3x + 2x = 5x$.\n\nفي $4x + 3 + x - 1$ نجمع حدود $x$ معًا والأعداد معًا: $5x + 2$." },
      ] },
      { title: "حل المعادلات", lessons: [
        { title: "معادلات الخطوة الواحدة", minutes: 8, summary: "العملية العكسية على الطرفين.",
          body: "المعادلة ميزان: ما نفعله بطرف نفعله بالآخر. في $x + 3 = 7$ نطرح 3 من الطرفين: $x = 4$.\n\nوفي $5x = 20$ نقسم الطرفين على 5: $x = 4$." },
        { title: "معادلات الخطوتين", minutes: 10, summary: "تخلّص من الجمع أولًا ثم الضرب.",
          body: "لحل $2x + 5 = 17$: نطرح 5 من الطرفين فنحصل على $2x = 12$، ثم نقسم على 2: $x = 6$.\n\nللتحقق نعوّض: $2(6) + 5 = 17$ ✓" },
        { title: "تمرين: حل المعادلات", minutes: 12, summary: "معادلات متدرجة مع حلول مفصلة.", body: "أوجد قيمة $x$ في كل معادلة.",
          exercise: [
            { type: "numeric", prompt: "حل: $x - 8 = 5$", answer: 13, hint: "أضف 8 إلى الطرفين.", steps: ["$x - 8 + 8 = 5 + 8$", "$x = 13$"] },
            { type: "numeric", prompt: "حل: $3x + 4 = 19$", answer: 5, hint: "اطرح 4 أولًا.", steps: ["$3x = 19 - 4 = 15$", "$x = \\frac{15}{3} = 5$"] },
            { type: "mcq", prompt: "بسّط: $2x + 7 + 3x - 2$", choices: ["$5x + 5$", "$5x + 9$", "$10x$"], answer: 0, steps: ["$2x + 3x = 5x$", "$7 - 2 = 5$"] },
            { type: "numeric", prompt: "حل: $\\frac{x}{4} = 3$", answer: 12, hint: "اضرب الطرفين في 4." },
          ] },
      ] },
    ],
  },
  {
    slug: "geometry-and-area", title: "الهندسة والمساحات", subtitle: "الأشكال حولك", glyph: "△ □ ○", daysAgo: 30,
    description: "تعرّف على الأشكال الهندسية الأساسية، واحسب المحيط والمساحة للمستطيل والمربع والمثلث والدائرة بأمثلة من الحياة اليومية.",
    keywords: "geometry area perimeter هندسة مساحة محيط مثلث دائرة مستطيل", subject: "math", level: "MIDDLE", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["تمييز الأشكال الهندسية وخصائصها", "حساب المحيط", "حساب مساحة المستطيل والمربع والمثلث", "حساب مساحة الدائرة"],
    prerequisites: ["الضرب والقسمة", "الأعداد العشرية"],
    sections: [
      { title: "الأشكال والمحيط", lessons: [
        { title: "الأشكال الهندسية الأساسية", minutes: 7, preview: true, summary: "الأضلاع والزوايا.",
          body: "المثلث له 3 أضلاع، والمربع 4 أضلاع متساوية وزواياه قائمة، والمستطيل كل ضلعين متقابلين فيه متساويان.\n\nمجموع زوايا أي مثلث يساوي $180^\\circ$." },
        { title: "المحيط", minutes: 7, summary: "طول الحدود الخارجية.",
          body: "المحيط هو مجموع أطوال الأضلاع. محيط المستطيل: $P = 2(l + w)$.\n\nمستطيل طوله 6 وعرضه 4: $P = 2(6 + 4) = 20$." },
      ] },
      { title: "المساحة", lessons: [
        { title: "مساحة المستطيل والمربع", minutes: 8, summary: "عدد الوحدات المربعة.",
          body: "مساحة المستطيل: $A = l \\times w$. مستطيل $5 \\times 3$ مساحته 15 وحدة مربعة.\n\nمساحة المربع: $A = s^2$، فمربع ضلعه 4 مساحته 16." },
        { title: "مساحة المثلث والدائرة", minutes: 10, summary: "نصف القاعدة في الارتفاع، و $\\pi r^2$.",
          body: "مساحة المثلث: $A = \\frac{1}{2} \\times b \\times h$.\n\nمساحة الدائرة: $A = \\pi r^2$، وبتقريب $\\pi \\approx 3.14$ تكون مساحة دائرة نصف قطرها 2 تقريبًا $12.56$." },
        { title: "تمرين: المحيط والمساحة", minutes: 12, summary: "احسب وتحقق.", body: "استخدم القوانين التي تعلمتها.",
          exercise: [
            { type: "numeric", prompt: "مساحة مستطيل طوله 8 وعرضه 5؟", answer: 40, steps: ["$A = 8 \\times 5 = 40$"] },
            { type: "numeric", prompt: "مساحة مثلث قاعدته 10 وارتفاعه 6؟", answer: 30, hint: "لا تنسَ النصف.", steps: ["$A = \\frac{1}{2} \\times 10 \\times 6$", "$= 30$"] },
            { type: "numeric", prompt: "محيط مربع ضلعه 7؟", answer: 28, steps: ["$P = 4 \\times 7 = 28$"] },
            { type: "mcq", prompt: "دائرة نصف قطرها 3. مساحتها تقريبًا ($\\pi \\approx 3.14$):", choices: ["$18.84$", "$28.26$", "$9.42$"], answer: 1, steps: ["$A = 3.14 \\times 3^2$", "$= 3.14 \\times 9 = 28.26$"] },
          ] },
      ] },
    ],
  },
  {
    slug: "middle-school-math-review", title: "مراجعة الرياضيات للمرحلة المتوسطة", subtitle: "استعد بثقة", glyph: "√x", daysAgo: 12,
    price: 4900, salePrice: 2900,
    description: "مراجعة مركّزة لأهم موضوعات المرحلة المتوسطة: القوى والجذور، وترتيب العمليات، والنسبة والتناسب، مع اختبار مراجعة شامل.",
    keywords: "review powers roots ratio مراجعة قوى جذور نسبة تناسب ترتيب العمليات", subject: "math", level: "MIDDLE", difficulty: "INTERMEDIATE", type: "REVIEW",
    objectives: ["حساب القوى والجذور التربيعية", "تطبيق ترتيب العمليات", "حل مسائل النسبة والتناسب"],
    prerequisites: ["الكسور والأعداد العشرية", "أساسيات الجبر"],
    sections: [
      { title: "الأعداد والقوى", lessons: [
        { title: "القوى والجذور التربيعية", minutes: 9, preview: true, summary: "$a^n$ و $\\sqrt{a}$.",
          body: "$2^3 = 2 \\times 2 \\times 2 = 8$.\n\nالجذر التربيعي هو العملية العكسية للتربيع: $\\sqrt{49} = 7$ لأن $7^2 = 49$." },
        { title: "ترتيب العمليات", minutes: 8, summary: "الأقواس، ثم القوى، ثم الضرب والقسمة، ثم الجمع والطرح.",
          body: "$3 + 4 \\times 2 = 3 + 8 = 11$ وليس 14.\n\n$(3 + 4) \\times 2 = 14$ لأن الأقواس أولًا." },
      ] },
      { title: "مراجعة شاملة", lessons: [
        { title: "النسبة والتناسب", minutes: 9, summary: "مقارنة كميتين.",
          body: "النسبة $2:3$ تعني لكل 2 من الأولى 3 من الثانية. في التناسب $\\frac{2}{3} = \\frac{x}{12}$ نجد $x = 8$." },
        { title: "اختبار مراجعة", minutes: 15, summary: "اختبر نفسك في كل موضوعات الدورة.", body: "اختبار قصير يغطي موضوعات الدورة.",
          exercise: [
            { type: "numeric", prompt: "احسب $\\sqrt{81} + 2^3$", answer: 17, steps: ["$\\sqrt{81} = 9$", "$2^3 = 8$", "$9 + 8 = 17$"] },
            { type: "numeric", prompt: "احسب $20 - 3 \\times 4$", answer: 8, hint: "الضرب قبل الطرح.", steps: ["$3 \\times 4 = 12$", "$20 - 12 = 8$"] },
            { type: "numeric", prompt: "إذا كان $\\frac{3}{5} = \\frac{x}{20}$ فما قيمة $x$؟", answer: 12, steps: ["$20 \\div 5 = 4$", "$x = 3 \\times 4 = 12$"] },
          ] },
      ] },
    ],
  },
  {
    slug: "english-from-zero", title: "تعلم الإنجليزية من الصفر", subtitle: "أول خطوة", glyph: "A B C", daysAgo: 85,
    description: "دورة للمبتدئين تمامًا: الحروف والأصوات، والتحية والتعارف، وأول جمل مفيدة باستخدام فعل to be، بشرح عربي واضح.",
    keywords: "beginner alphabet greetings to be مبتدئ حروف تحية تعارف", subject: "english", level: "ALL", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["التعرف على الحروف الإنجليزية الكبيرة والصغيرة", "استخدام عبارات التحية والتعارف", "تكوين جمل بسيطة مع am / is / are"],
    prerequisites: ["لا يوجد، الدورة تبدأ من الصفر"],
    sections: [
      { title: "الحروف والتحية", lessons: [
        { title: "الحروف الإنجليزية", minutes: 8, preview: true, summary: "26 حرفًا بشكلين.",
          body: "تتكون الأبجدية الإنجليزية من 26 حرفًا، ولكل حرف شكل كبير (A) وصغير (a).\n\nالحروف المتحركة (Vowels) هي: a, e, i, o, u. وتُكتب الإنجليزية من اليسار إلى اليمين." },
        { title: "التحية والتعارف", minutes: 7, summary: "Hello, Good morning, Nice to meet you.",
          body: "Hello = مرحبًا. Good morning = صباح الخير. My name is Ali = اسمي علي.\n\nNice to meet you = سعيد بلقائك." },
      ] },
      { title: "أول جملة", lessons: [
        { title: "الضمائر وفعل to be", minutes: 9, summary: "I am, you are, he is.",
          body: "I am a student = أنا طالب. You are kind = أنت لطيف. She is a teacher = هي معلمة.\n\nنستخدم am مع I، و is مع he / she / it، و are مع you / we / they." },
        { title: "تمرين: أول خطوة", minutes: 10, summary: "مطابقة، وإكمال، وترتيب.", body: "طبّق ما تعلمته في هذه التمارين القصيرة.",
          exercise: [
            { type: "match", prompt: "طابق كل عبارة بمعناها:", pairs: [["Hello", "مرحبًا"], ["Good morning", "صباح الخير"], ["Thank you", "شكرًا"], ["Goodbye", "مع السلامة"]] },
            { type: "fill", prompt: "أكمل بالفعل المناسب:", sentence: "She ___ a teacher.", answers: ["is"], hint: "مع she نستخدم is." },
            { type: "fill", prompt: "أكمل بالفعل المناسب:", sentence: "We ___ friends.", answers: ["are"], hint: "مع we نستخدم are." },
            { type: "order", prompt: "رتّب الكلمات لتكوين جملة صحيحة:", words: ["name", "is", "My", "Sara"], answer: "My name is Sara" },
          ] },
      ] },
    ],
  },
  {
    slug: "english-grammar-basics", title: "أساسيات القواعد الإنجليزية", subtitle: "قواعد بلا تعقيد", glyph: "Aa", daysAgo: 70,
    description: "المضارع البسيط والماضي البسيط، وأدوات التعريف والتنكير، وجمع الأسماء، مع شرح بالعربية وأمثلة إنجليزية قصيرة.",
    keywords: "grammar present past simple articles plural قواعد مضارع ماضي أدوات جمع", subject: "english", level: "MIDDLE", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["استخدام المضارع البسيط والماضي البسيط", "التمييز بين a و an و the", "جمع الأسماء المنتظمة وأشهر الشاذة"],
    prerequisites: ["معرفة الحروف وفعل to be"],
    sections: [
      { title: "الأزمنة", lessons: [
        { title: "المضارع البسيط", minutes: 9, preview: true, summary: "للعادات والحقائق.",
          body: "نستخدم المضارع البسيط للعادات: I play football every day.\n\nمع he / she / it نضيف s للفعل: She plays football." },
        { title: "الماضي البسيط", minutes: 9, summary: "أحداث انتهت.",
          body: "الأفعال المنتظمة نضيف لها ed: play → played.\n\nبعض الأفعال شاذة: go → went، eat → ate، see → saw." },
      ] },
      { title: "الأدوات والأسماء", lessons: [
        { title: "a / an / the", minutes: 7, summary: "أدوات التنكير والتعريف.",
          body: "نستخدم a قبل الكلمة التي تبدأ بصوت ساكن: a book. و an قبل صوت متحرك: an apple.\n\nنستخدم the لشيء محدد معروف: the sun." },
        { title: "جمع الأسماء", minutes: 7, summary: "s و es والجموع الشاذة.",
          body: "book → books، box → boxes.\n\nجموع شاذة شائعة: child → children، man → men، tooth → teeth." },
        { title: "تمرين: القواعد", minutes: 12, summary: "اختيار من متعدد وإكمال.", body: "اختر الإجابة الصحيحة أو أكمل الفراغ.",
          exercise: [
            { type: "mcq", prompt: "He ___ to school every day.", choices: ["go", "goes", "went"], answer: 1, hint: "عادة يومية مع he.", steps: ["every day ← مضارع بسيط", "مع he نضيف es: goes"] },
            { type: "mcq", prompt: "Yesterday, I ___ a movie.", choices: ["see", "sees", "saw"], answer: 2, hint: "Yesterday تدل على الماضي." },
            { type: "fill", prompt: "أكمل بـ a أو an:", sentence: "She ate ___ orange.", answers: ["an"], hint: "orange تبدأ بصوت متحرك." },
            { type: "fill", prompt: "اكتب جمع child:", sentence: "Two ___ are playing.", answers: ["children"] },
          ] },
      ] },
    ],
  },
  {
    slug: "everyday-words-and-phrases", title: "أهم الكلمات والعبارات اليومية", subtitle: "إنجليزية تستخدمها كل يوم", glyph: "Hi!", daysAgo: 50,
    description: "مفردات وعبارات منظمة حسب المواقف: في البيت، وفي المدرسة، وفي السوق، مع تمارين مطابقة تساعدك على التذكّر.",
    keywords: "vocabulary phrases words مفردات كلمات عبارات يومية", subject: "english", level: "ALL", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["تعلّم مفردات البيت والمدرسة والسوق", "استخدام عبارات جاهزة في مواقف يومية"],
    prerequisites: ["لا يوجد"],
    sections: [
      { title: "البيت والمدرسة", lessons: [
        { title: "في البيت", minutes: 6, preview: true, summary: "kitchen, bedroom, table…",
          body: "kitchen = مطبخ، bedroom = غرفة نوم، table = طاولة، window = نافذة.\n\nعبارة مفيدة: Where is the kitchen? = أين المطبخ؟" },
        { title: "في المدرسة", minutes: 6, summary: "teacher, classroom, homework…",
          body: "teacher = معلم، classroom = فصل، homework = واجب، pencil = قلم رصاص.\n\nعبارة مفيدة: Can you repeat, please? = هل يمكنك الإعادة من فضلك؟" },
      ] },
      { title: "في السوق والتدريب", lessons: [
        { title: "في السوق", minutes: 6, summary: "How much is this?",
          body: "How much is this? = بكم هذا؟ I would like… = أود…\n\ncheap = رخيص، expensive = غالٍ." },
        { title: "تمرين: المفردات", minutes: 8, summary: "طابق الكلمات بمعانيها.", body: "طابق كل كلمة بمعناها.",
          exercise: [
            { type: "match", prompt: "مفردات البيت والمدرسة:", pairs: [["kitchen", "مطبخ"], ["window", "نافذة"], ["homework", "واجب"], ["teacher", "معلم"]] },
            { type: "mcq", prompt: "ماذا تقول لتسأل عن السعر؟", choices: ["Where is this?", "How much is this?", "What is this?"], answer: 1 },
            { type: "fill", prompt: "أكمل:", sentence: "Can you ___, please?", answers: ["repeat"], hint: "تعني: هل يمكنك الإعادة؟" },
          ] },
      ] },
    ],
  },
  {
    slug: "english-conversation", title: "المحادثة باللغة الإنجليزية", subtitle: "تحدّث بثقة", glyph: "Talk", daysAgo: 20,
    description: "حوارات قصيرة لمواقف حقيقية: تقديم نفسك، وطرح الأسئلة، والطلب في المطعم، مع تمارين ترتيب الجمل وفهم الحوار.",
    keywords: "conversation speaking dialogue محادثة حوار تحدث أسئلة", subject: "english", level: "SECONDARY", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["تقديم نفسك بجمل متكاملة", "صياغة الأسئلة بـ Wh-questions", "إدارة حوار بسيط في مطعم"],
    prerequisites: ["أساسيات القواعد الإنجليزية"],
    sections: [
      { title: "التعارف والأسئلة", lessons: [
        { title: "تقديم نفسك", minutes: 8, preview: true, summary: "Let me introduce myself.",
          body: "Hi, I'm Omar. I'm 15 years old. I'm from Jeddah. I like reading and football.\n\nلاحظ: I'm اختصار I am." },
        { title: "طرح الأسئلة", minutes: 9, summary: "What, Where, When, Why, How.",
          body: "What is your name? / Where do you live? / How old are you?\n\nفي الأسئلة مع do: Where do you live? وليس Where you live?" },
      ] },
      { title: "مواقف يومية", lessons: [
        { title: "الطلب في المطعم", minutes: 8, summary: "I'd like…, Could I have…?",
          body: "Waiter: Are you ready to order?\nYou: Yes. I'd like a chicken sandwich, please.\n\nCould I have the bill, please? = هل يمكنني الحصول على الفاتورة؟" },
        { title: "تمرين: المحادثة", minutes: 10, summary: "رتّب واقرأ وأجب.", body: "تمارين على بناء الأسئلة وفهم الحوار.",
          exercise: [
            { type: "order", prompt: "رتّب السؤال:", words: ["do", "live", "Where", "you"], answer: "Where do you live?" },
            { type: "mcq", prompt: "ما الرد المناسب على: How old are you?", choices: ["I'm fine.", "I'm 16 years old.", "I'm from Riyadh."], answer: 1 },
            { type: "mcq", passage: "Lina: Hi! Are you new here?\nSam: Yes, I moved from Dammam last week.\nLina: Welcome! Do you like the school?\nSam: Yes, the teachers are very helpful.", prompt: "من أين انتقل Sam؟", choices: ["Riyadh", "Dammam", "Jeddah"], answer: 1 },
          ] },
      ] },
    ],
  },
  {
    slug: "listening-and-pronunciation", title: "الاستماع والنطق", subtitle: "اسمع جيدًا، انطق بوضوح", glyph: "/θ/", daysAgo: 8,
    description: "تدرّب على الأصوات التي تصعب على المتعلم العربي مثل p و v و th، وعلى النبر في الكلمات، مع تمارين استماع تعتمد على قارئ الصوت في متصفحك.",
    keywords: "listening pronunciation sounds stress استماع نطق أصوات نبر", subject: "english", level: "ALL", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["التمييز بين p و b، وبين f و v", "نطق صوتي th", "معرفة موضع النبر في الكلمات الشائعة"],
    prerequisites: ["معرفة الحروف الإنجليزية"],
    faqs: [{ q: "من أين يأتي الصوت في تمارين الاستماع؟", a: "تستخدم التمارين خاصية تحويل النص إلى كلام المدمجة في متصفحك، لذا قد تختلف نبرة الصوت من جهاز لآخر." }],
    sections: [
      { title: "الأصوات", lessons: [
        { title: "أصوات p و b و v", minutes: 8, preview: true, summary: "أصوات غير موجودة في العربية.",
          body: "صوت p يخرج بدفعة هواء دون اهتزاز الحبال الصوتية: pen. أما b ففيه اهتزاز: Ben.\n\nصوت v يشبه f لكن مع اهتزاز: fan / van." },
        { title: "صوتا th", minutes: 7, summary: "think و this.",
          body: "في think يكون th صوتًا مهموسًا قريبًا من «ث». وفي this يكون مجهورًا قريبًا من «ذ».\n\nضع طرف لسانك بين أسنانك عند النطق." },
      ] },
      { title: "النبر والتدريب", lessons: [
        { title: "النبر في الكلمات", minutes: 7, summary: "أي مقطع نضغط عليه؟",
          body: "في كلمة TEAcher يقع النبر على المقطع الأول، وفي comPUter على المقطع الثاني.\n\nالنبر الخاطئ قد يجعل الكلمة صعبة الفهم." },
        { title: "تمرين استماع", minutes: 10, summary: "استمع واختر ما سمعته.", body: "اضغط زر الاستماع لكل سؤال، ثم اختر الكلمة التي سمعتها. يمكنك الاستماع أكثر من مرة.",
          exercise: [
            { type: "mcq", speak: "van", prompt: "ما الكلمة التي سمعتها؟", choices: ["fan", "van", "ban"], answer: 1 },
            { type: "mcq", speak: "think", prompt: "ما الكلمة التي سمعتها؟", choices: ["sink", "think", "this"], answer: 1 },
            { type: "mcq", speak: "pen", prompt: "ما الكلمة التي سمعتها؟", choices: ["Ben", "pen", "pan"], answer: 1 },
            { type: "mcq", prompt: "أين يقع النبر في كلمة computer؟", choices: ["COMputer", "comPUter", "compuTER"], answer: 1 },
          ] },
      ] },
    ],
  },
  {
    slug: "english-exam-prep", title: "التحضير لاختبارات اللغة الإنجليزية", subtitle: "استراتيجيات ونماذج", glyph: "A+", daysAgo: 3,
    price: 7900,
    description: "استراتيجيات قراءة النصوص، وأكثر القواعد ورودًا في الاختبارات، وإدارة الوقت، مع نموذج اختبار تدريبي مصحّح تلقائيًا.",
    keywords: "exam test preparation reading strategies اختبار تحضير قراءة استراتيجيات", subject: "english", level: "SECONDARY", difficulty: "ADVANCED", type: "EXAM_PREP",
    objectives: ["تطبيق استراتيجيات skimming و scanning", "تجنّب الأخطاء الشائعة في القواعد", "إدارة الوقت أثناء الاختبار"],
    prerequisites: ["أساسيات القواعد الإنجليزية", "مفردات متوسطة"],
    sections: [
      { title: "استراتيجيات", lessons: [
        { title: "استراتيجيات القراءة", minutes: 10, preview: true, summary: "Skimming و Scanning.",
          body: "Skimming: قراءة سريعة لمعرفة الفكرة العامة. Scanning: البحث عن معلومة محددة كاسم أو رقم.\n\nاقرأ الأسئلة أولًا، ثم ابحث في النص." },
        { title: "قواعد تتكرر في الاختبارات", minutes: 10, summary: "التوافق بين الفاعل والفعل، والأزمنة.",
          body: "The list of items is long (الفاعل list مفرد).\n\nأفعال بعد since و for: I have lived here since 2020." },
      ] },
      { title: "التدريب", lessons: [
        { title: "إدارة الوقت", minutes: 6, summary: "وزّع وقتك قبل البدء.",
          body: "قسّم الوقت على الأقسام حسب عدد الأسئلة، ولا تتوقف طويلًا عند سؤال واحد؛ ضع علامة وعد إليه لاحقًا." },
        { title: "نموذج اختبار", minutes: 20, summary: "قراءة وقواعد.", body: "اقرأ النص ثم أجب عن الأسئلة.",
          exercise: [
            { type: "mcq", passage: "Bees are important for farming. While collecting nectar, they carry pollen from flower to flower, which helps plants produce fruit. Without bees, many crops such as apples and almonds would be much smaller.", prompt: "What is the main idea of the passage?", choices: ["Bees make honey.", "Bees help plants produce fruit.", "Almonds are expensive."], answer: 1, hint: "اقرأ الجملة الأولى والثانية." },
            { type: "mcq", prompt: "The number of students ___ increasing.", choices: ["are", "is", "be"], answer: 1, steps: ["الفاعل الحقيقي: The number (مفرد)", "إذن: is"] },
            { type: "fill", prompt: "أكمل بـ since أو for:", sentence: "I have studied English ___ five years.", answers: ["for"], hint: "مع المدة نستخدم for." },
          ] },
      ] },
    ],
  },
];


// Sections borrowed from the library, by old course slug.
const from = (...slugs: string[]) => slugs.flatMap((slug) => library.find((c) => c.slug === slug)!.sections);
const SAR = (n: number) => n * 100; // prices are stored in halalas

const courses: C[] = [
  {
    slug: "english-foundation", days: 4, hours: 1.5, title: "باقة الإنجليزي التأسيسي", subtitle: "للمبتدئين · 3 أشهر", glyph: "A B C", daysAgo: 30,
    price: SAR(1500), billing: "ONCE", months: 3,
    description: "برنامج تأسيسي متكامل لمدة ثلاثة أشهر لمن يبدأ من الصفر: الحروف والأصوات، والتحية والتعارف، وأساسيات القواعد، وتكوين أولى الجمل بثقة.",
    keywords: "english beginner foundation grammar تأسيس مبتدئ قواعد حروف", subject: "english", level: "ALL", difficulty: "BEGINNER", type: "COURSE",
    objectives: ["قراءة الحروف والأصوات الإنجليزية ونطقها", "استخدام عبارات التحية والتعارف", "تكوين جمل صحيحة مع فعل to be", "استخدام المضارع البسيط والماضي البسيط", "أدوات التعريف والتنكير وجمع الأسماء"],
    prerequisites: ["لا يوجد، الباقة تبدأ من الصفر"],
    faqs: [{ q: "كم مدة الباقة؟", a: "ثلاثة أشهر بسعر 1,500 ر.س للباقة كاملة." }],
    sections: from("english-from-zero", "english-grammar-basics"),
  },
  {
    slug: "english-conversation-listening", days: 4, hours: 1.5, title: "باقة المحادثة والاستماع", subtitle: "تحدّث بثقة · شهران", glyph: "Talk", daysAgo: 25,
    price: SAR(1000), billing: "ONCE", months: 2,
    description: "شهران من التدريب العملي على المحادثة في مواقف حقيقية، مع تمارين استماع ونطق للأصوات التي تصعب على المتعلم العربي.",
    keywords: "conversation listening speaking pronunciation محادثة استماع نطق تحدث", subject: "english", level: "ALL", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["تقديم نفسك وإدارة حوار بسيط", "صياغة الأسئلة بشكل صحيح", "التمييز بين الأصوات المتشابهة ونطقها بوضوح", "فهم الحوارات القصيرة عند الاستماع"],
    prerequisites: ["أساسيات اللغة (يُنصح بباقة الإنجليزي التأسيسي)"],
    faqs: [{ q: "كم مدة الباقة؟", a: "شهران بسعر 1,000 ر.س للباقة كاملة." }],
    sections: from("english-conversation", "listening-and-pronunciation"),
  },
  {
    slug: "ielts-toefl-prep", days: 4, hours: 1.5, title: "باقة التحضير لاختباري IELTS و TOEFL", subtitle: "استراتيجيات ونماذج · 3 أشهر", glyph: "IELTS", daysAgo: 20,
    price: SAR(2500), billing: "ONCE", months: 3,
    description: "ثلاثة أشهر من التحضير المركّز لاختباري IELTS و TOEFL: استراتيجيات القراءة، والقواعد الأكثر ورودًا، وإدارة الوقت، ونماذج تدريبية مصحّحة.",
    keywords: "ielts toefl exam test preparation ايلتس توفل اختبار تحضير", subject: "english", level: "ALL", difficulty: "ADVANCED", type: "EXAM_PREP",
    objectives: ["فهم أقسام الاختبار وطريقة التعامل مع كل قسم", "تطبيق استراتيجيات skimming و scanning", "تجنّب الأخطاء الشائعة في القواعد", "إدارة الوقت أثناء الاختبار"],
    prerequisites: ["مستوى متوسط في اللغة الإنجليزية"],
    faqs: [{ q: "كم مدة الباقة؟", a: "ثلاثة أشهر بسعر 2,500 ر.س للباقة كاملة." }],
    sections: from("english-exam-prep"),
  },
  {
    slug: "english-continuous-learning", days: 4, hours: 1.5, title: "باقة التعلّم المستمر", subtitle: "اشتراك شهري", glyph: "Hi!", daysAgo: 15,
    price: SAR(600), billing: "MONTHLY",
    description: "اشتراك شهري مرن للحفاظ على مستواك وتطويره باستمرار: مفردات وعبارات يومية جديدة وتدريب منتظم، وتستطيع الاستمرار بالشهر الذي يناسبك.",
    keywords: "english monthly subscription vocabulary اشتراك شهري مستمر مفردات", subject: "english", level: "ALL", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["توسيع حصيلتك من المفردات والعبارات اليومية", "ممارسة منتظمة تحافظ على مستواك", "تطبيق ما تتعلمه في مواقف حقيقية"],
    prerequisites: ["أساسيات اللغة"],
    faqs: [{ q: "كيف يعمل الاشتراك؟", a: "الاشتراك شهري بسعر 600 ر.س لكل شهر." }],
    sections: from("everyday-words-and-phrases"),
  },
  {
    slug: "math-curriculum-semester", days: 4, hours: 1.5, title: "باقة شرح المنهج", subtitle: "ابتدائي · متوسط · ثانوي — على مدار الفصل (4 أشهر)", glyph: "½ x² △", daysAgo: 28,
    price: SAR(2000), billing: "ONCE", months: 4,
    description: "شرح منهج الرياضيات للمراحل الابتدائية والمتوسطة والثانوية على مدار الفصل الدراسي كاملًا (4 أشهر)، بدروس متدرّجة وتمارين تفاعلية بعد كل وحدة.",
    keywords: "math curriculum semester school شرح المنهج فصل ابتدائي متوسط اعدادي ثانوي كسور جبر هندسة", subject: "math", level: "ALL", difficulty: "INTERMEDIATE", type: "COURSE",
    objectives: ["فهم موضوعات المنهج خطوة بخطوة", "الكسور والأعداد العشرية", "الجبر وحل المعادلات", "الهندسة والمساحات"],
    prerequisites: ["حدّد مرحلتك الدراسية عند الطلب"],
    faqs: [{ q: "كم مدة الباقة؟", a: "فصل دراسي كامل (4 أشهر) بسعر 2,000 ر.س." }],
    sections: from("fractions-and-decimals", "algebra-and-equations", "geometry-and-area"),
  },
  {
    slug: "math-private-lesson", title: "باقة الدرس الخصوصي", subtitle: "حسب الموضوع الذي تختاره", glyph: "1 : 1", daysAgo: 10,
    price: SAR(25), billing: "HOURLY",
    description: "حصص خاصة في الموضوع الذي تحتاجه تحديدًا: تختار الموضوع، وتدفع حسب عدد الساعات التي تحتاجها.",
    keywords: "math private lesson tutoring hour درس خصوصي حصة خاصة ساعة", subject: "math", level: "ALL", difficulty: "INTERMEDIATE", type: "TUTORING",
    objectives: ["شرح مركّز في الموضوع الذي تختاره", "حل أسئلتك وواجباتك خطوة بخطوة", "مرونة في عدد الساعات"],
    prerequisites: ["حدّد الموضوع ومرحلتك الدراسية عند الطلب"],
    faqs: [{ q: "كيف يُحسب السعر؟", a: "25 ر.س للساعة الواحدة، وتحدد عدد الساعات عند الطلب." }],
    sections: [{ title: "كيف تعمل الحصة الخاصة", lessons: [
      { title: "اختر موضوعك واحجز", minutes: 3, preview: true, summary: "خطوات الحجز.",
        body: "1. اضغط «احجز حصتك الآن» واكتب الموضوع الذي تحتاجه ومرحلتك الدراسية وعدد الساعات.\n\n2. نتواصل معك عبر واتساب لتأكيد الموعد والدفع.\n\n3. بعد التأكيد يُفعَّل لك الوصول إلى مواد الباقة على المنصة." },
    ] }, ...from("middle-school-math-review")],
  },
  {
    slug: "math-foundations", title: "باقة بناء أساسيات الرياضيات", subtitle: "ابتدائي · متوسط · ثانوي", glyph: "+ − × ÷", daysAgo: 8,
    price: SAR(40), billing: "HOURLY",
    description: "حصص لبناء الأساس من جديد: الأعداد ومنازلها والعمليات الحسابية الأربع، حتى يصبح الطالب قادرًا على متابعة منهجه بثقة.",
    keywords: "math foundations basics arithmetic أساسيات تأسيس عمليات حسابية أعداد", subject: "math", level: "ALL", difficulty: "BEGINNER", type: "TUTORING",
    objectives: ["فهم الأعداد ومنازلها", "إتقان الجمع والطرح والضرب والقسمة", "سد الفجوات التي تعيق فهم المنهج"],
    prerequisites: ["لا يوجد"],
    faqs: [{ q: "كيف يُحسب السعر؟", a: "40 ر.س للساعة الواحدة، وتحدد عدد الساعات عند الطلب." }],
    sections: from("math-basics", "arithmetic-step-by-step"),
  },
  {
    slug: "math-exam-prep", title: "باقة التحضير للامتحانات الفصلية والنهائية", subtitle: "مراجعة مركّزة قبل الاختبار", glyph: "√x", daysAgo: 5,
    price: SAR(35), billing: "HOURLY",
    description: "حصص مراجعة مركّزة قبل الاختبارات الفصلية والنهائية: أهم موضوعات المنهج، وحل نماذج أسئلة، وتنظيم المراجعة.",
    keywords: "math exam test final midterm review امتحان اختبار نهائي فصلي مراجعة", subject: "math", level: "ALL", difficulty: "INTERMEDIATE", type: "EXAM_PREP",
    objectives: ["مراجعة أهم موضوعات المنهج", "التدريب على نماذج أسئلة الاختبارات", "تنظيم وقت المراجعة"],
    prerequisites: ["حدّد مرحلتك وموعد اختبارك عند الطلب"],
    faqs: [{ q: "كيف يُحسب السعر؟", a: "35 ر.س للساعة الواحدة، وتحدد عدد الساعات عند الطلب." }],
    sections: from("middle-school-math-review"),
  },
];

async function main() {
  const subjectIds: Record<string, string> = {};
  for (const s of subjects) {
    const row = await db.subject.upsert({ where: { slug: s.slug }, update: s, create: s });
    subjectIds[s.slug] = row.id;
  }

  for (const c of courses) {
    if (await db.course.findUnique({ where: { slug: c.slug } })) { console.log(`skip ${c.slug} (exists)`); continue; }
    await db.course.create({
      data: {
        slug: c.slug, title: c.title, subtitle: c.subtitle, description: c.description, keywords: c.keywords,
        subjectId: subjectIds[c.subject], level: c.level, difficulty: c.difficulty, type: c.type,
        price: c.price ?? 0, salePrice: c.salePrice ?? null, billing: c.billing ?? "ONCE", durationMonths: c.months ?? null, daysPerWeek: c.days ?? null, hoursPerDay: c.hours ?? null,
        coverGlyph: c.glyph, status: "PUBLISHED", isDemo: false,
        publishedAt: new Date(Date.now() - c.daysAgo * 864e5),
        objectives: JSON.stringify(c.objectives), prerequisites: JSON.stringify(c.prerequisites), faqs: JSON.stringify(c.faqs ?? []),
        sections: {
          create: c.sections.map((s, si) => ({
            title: s.title, order: si,
            lessons: { create: s.lessons.map((l, li) => ({
              title: l.title, summary: l.summary ?? "", body: l.body, minutes: l.minutes, isPreview: !!l.preview, order: li,
              exercise: l.exercise ? JSON.stringify(l.exercise) : null,
            })) },
          })),
        },
      },
    });
    console.log(`created ${c.slug}`);
  }

  // Retire the old sample courses (archived, not deleted, so existing enrollments survive).
  const retired = await db.course.updateMany({ where: { isDemo: true, slug: { notIn: courses.map((c) => c.slug) }, status: { not: "ARCHIVED" } }, data: { status: "ARCHIVED" } });
  if (retired.count) console.log(`archived ${retired.count} old sample courses`);

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const salt = randomBytes(16);
    const hash = (await promisify(scrypt)(ADMIN_PASSWORD, salt, 64)) as Buffer;
    const passwordHash = `${salt.toString("hex")}:${hash.toString("hex")}`; // same format as src/lib/auth.ts
    const email = ADMIN_EMAIL.toLowerCase();
    await db.user.upsert({ where: { email }, update: { role: "ADMIN", passwordHash }, create: { email, name: "المدير", role: "ADMIN", passwordHash } });
    console.log(`admin ready: ${email}`);
  }
}

main().finally(() => db.$disconnect());
