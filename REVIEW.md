# Dataset review sheet

48 items across 5 tasks.

**How to use:** go down each row.
- Reference is right → leave it.
- Wrong → write the correction in the **fix** column (or just tell Claude the id + fix).
- ⚠️ = Claude was unsure — check these first.

## grammar (10)

| fix? | id | input | current reference | tags |
|---|---|---|---|---|
|  | gram-001 | அவர்கள் நேற்று வந்தான். | அவர்கள் நேற்று வந்தார்கள். | easy, number_agreement |
|  | gram-002 | நான் பள்ளிக்கு போனான். | நான் பள்ளிக்கு போனேன். | easy, person_agreement |
|  | gram-003 | அவள் சாப்பிட்டான். | அவள் சாப்பிட்டாள். | easy, gender_agreement |
| ⚠️ | gram-004 | நாளை நான் கடைக்கு போனேன். | நாளை நான் கடைக்கு போவேன். | medium, tense |
|  | gram-005 | அவன் வீடு இருக்கிறான். | அவன் வீட்டில் இருக்கிறான். | medium, case_locative |
| ⚠️ | gram-006 | மூன்று பையன் வந்தான். | மூன்று பையன்கள் வந்தார்கள். | medium, plural_agreement |
|  | gram-007 | என் அம்மா நல்லவன். | என் அம்மா நல்லவள். | easy, gender_agreement |
|  | gram-008 | நேற்று நான் வருகிறேன். | நேற்று நான் வந்தேன். | medium, tense |
| ⚠️ | gram-009 | ஆசிரியர் வந்தான். | ஆசிரியர் வந்தார். | medium, honorific_agreement |
|  | gram-010 | நான் அவன் பணம் கொடுத்தேன். | நான் அவனுக்கு பணம் கொடுத்தேன். | medium, case_dative |

## sentiment (3)

| fix? | id | input | current reference | tags |
|---|---|---|---|---|
|  | sent-001 | படம் மிகவும் நன்றாக இருந்தது. | positive | formal, easy |
|  | sent-002 | சேவை மிகவும் மோசமாக இருந்தது. | negative | formal, easy |
|  | sent-003 | படம் சூப்பர், ஆனா க்ளைமாக்ஸ் கொஞ்சம் சோகம். | mixed | colloquial, medium |

## translation_en_ta (5)

| fix? | id | input | current reference | tags |
|---|---|---|---|---|
|  | en-ta-001 | The weather is nice today. | இன்று வானிலை நன்றாக இருக்கிறது. | formal, easy |
|  | en-ta-002 | I am drinking water. | நான் தண்ணீர் குடிக்கிறேன். | formal, easy |
|  | en-ta-003 | Where is the railway station? | ரயில் நிலையம் எங்கே இருக்கிறது? | formal, easy |
|  | en-ta-004 | She is reading a book. | அவள் ஒரு புத்தகம் படிக்கிறாள். | formal, medium |
|  | en-ta-005 | We will go to school tomorrow. | நாங்கள் நாளை பள்ளிக்குச் செல்வோம். | formal, medium |

## translation_ta_en (10)

| fix? | id | input | current reference | tags |
|---|---|---|---|---|
|  | ta-en-001 | இன்று வானிலை நன்றாக இருக்கிறது. | The weather is nice today. | formal, easy |
|  | ta-en-002 | எனக்கு தமிழ் தெரியும். | I know Tamil. | neutral, easy |
|  | ta-en-003 | அவர் நேற்று சென்னைக்கு போனார். | He went to Chennai yesterday. | honorific, easy |
|  | ta-en-004 | நாங்கள் நாளை திரைப்படம் பார்க்கப் போகிறோம். | We are going to watch a movie tomorrow. | formal, medium |
|  | ta-en-005 | உனக்கு என்ன வேணும்? | What do you want? | colloquial, easy |
|  | ta-en-006 | அவங்க ரொம்ப நல்லவங்க. | They are very nice people. | colloquial, medium |
| ⚠️ | ta-en-007 | எனக்கு உடம்பு சரியில்லை. | I am not feeling well. | idiomatic, medium |
|  | ta-en-008 | இந்த புத்தகம் மிகவும் சுவாரஸ்யமாக இருந்தது. | This book was very interesting. | formal, medium |
| ⚠️ | ta-en-009 | கடையை மூடிட்டாங்க. | They closed the shop. | colloquial, medium |
| ⚠️ | ta-en-010 | மழை பெய்யுது, குடையை எடுத்துக்கோ. | It is raining, take an umbrella. | colloquial, medium |

## transliteration (20)

| fix? | id | input | current reference | tags |
|---|---|---|---|---|
|  | thang-001 | naan veetuku poren | நான் வீட்டுக்கு போறேன் | colloquial, easy |
|  | thang-002 | enaku pasikkuthu | எனக்கு பசிக்குது | colloquial, easy |
|  | thang-003 | neenga epadi irukeenga | நீங்க எப்படி இருக்கீங்க | polite_spoken, easy |
|  | thang-004 | naalaikku varen | நாளைக்கு வரேன் | colloquial, easy |
| ⚠️ | thang-005 | enna panre | என்ன பண்றே | casual, easy |
|  | thang-006 | konjam thanni kudunga | கொஞ்சம் தண்ணி குடுங்க | spoken, medium |
|  | thang-007 | enaku coffee venum | எனக்கு காபி வேணும் | colloquial, medium |
|  | thang-008 | office ku late aachu | ஆபீஸுக்கு லேட் ஆச்சு | colloquial, medium |
|  | thang-009 | saapteengala | சாப்டீங்களா | polite_spoken, medium |
|  | thang-010 | romba nandri | ரொம்ப நன்றி | neutral, easy |
|  | thang-011 | naan unna miss panren | நான் உன்ன மிஸ் பண்றேன் | colloquial, medium |
|  | thang-012 | enaku romba kovam varuthu | எனக்கு ரொம்ப கோவம் வருது | colloquial, medium |
|  | thang-013 | veetla yaaru illa | வீட்ல யாரு இல்ல | colloquial, medium |
|  | thang-014 | naalaikku meeting iruku | நாளைக்கு மீட்டிங் இருக்கு | colloquial, medium |
| ⚠️ | thang-015 | nee enga poora | நீ எங்க போற | casual, medium |
|  | thang-016 | konjam help pannunga | கொஞ்சம் ஹெல்ப் பண்ணுங்க | colloquial, medium |
|  | thang-017 | enaku puriyala | எனக்கு புரியல | colloquial, medium |
| ⚠️ | thang-018 | saaptutu padi | சாப்ட்டுட்டு படி | colloquial, hard |
| ⚠️ | thang-019 | phone la pesitu iruken | ஃபோன்ல பேசிட்டு இருக்கேன் | colloquial, hard |
|  | thang-020 | romba time aachu | ரொம்ப டைம் ஆச்சு | colloquial, medium |

