import { useState, useRef, useEffect, createContext, useContext } from "react";

// ===== LOGO =====
const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAClAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDxmiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACijFLQAUUUUAJRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUALRSUUAFFFFABRRRQAUUUUAFFFFAGv4b8M3/inUGsNNMBuFQuEllCbgOuM9an8T+DNb8IvANWt1RbgExvG4dSR1GR35FZml6ldaPqdvqNlIY7i2cPG3uPX2PQj0NfRksWl/Fj4fKVKxvMMqcZNtOv+fxB96APDPDPgLX/FltNc6XbI0MLhGeWQIC2M4GeuOPzFZmu6Jd+HdVk0y+aE3EQHmLFIHCk84JHevoTXdS074WeAI4LNVMsaeTaoessp5Ln8csfy9K+b7m4mu7mW5uJGlmlcu7sclmJySaAIqKKKACiiigAooooAKKKKACijFFABRRRQAUUUUAFFLSYoAKKXFFACV7Z8M/C+hWvhK3ufENpbSz69cGK2E8QYhdrbQuemcMcj1WvGLVIZLuFLmUxQs4EkgXJVc8nHfAr1/V/jDodjLZ2ej6DDqNnYxJ5Etx+7MTDj5QVJGABzQBk/D7wxBYfFi90PVLSG6S1imAWeMOrAFdrYPqCD+NcBrkaRa9qEcaKiJdSqqqMAAOcAV6x/wsLwgfH1l4oSeeIyae8F2n2diVf5Sv17jI/uisDxHJ8Lrqx1G606fUW1OYPJCHDhDITnnI6ZNAHnAGTivon4b+HbjwR4Nkvbu2u7i7vNs8ttAu5o1x8oC5GWwcnv27V5D8O28N23iJNR8S3ywW9niSKExM/myds7QeB156nHvXeth8TfB2pXcdpba3F5shwoljeME+mWAGaAOP8AiPpsPj/whH4m0ZbnzdNaRXglQqzID8/y9iCM/QH2rxWyUNfQKwBBlUEHvyK948NfEDwxoFtqOn6tqYhul1O7ZkEMjDBlYjkAivJfFQ8PweLTd+HrwT6bLIswVY2UwnOWTDAcenscdqAPd7/QYItdtrS08CaRc6bKB590ViQxZJz8m3JwMHj1ryW48I6dqnxlk0HSoimnJcBpUAICKqhpAM9s5A+orrNW8dfDzWdat9WurzWUuLYKEEIdE+ViwyAfU1Vt/ip4bh8Q634k+yzm8lgS2soTHguqjOWYdNzEDvgKKAI/it4f0W88Oxa94etbaJNPuntLsW0QQfe25OB2YYz6NW/omkJH8PtButM8GaZrV1NAvnecIoyBj7xZgc81gWfxX8PavpOpaNrGiJpVpdxMN1mvmbnbqxAA56HPtTLXxl4HvvBmkaLrN1qaSWEQB+yqyZbGDyOooAyPjJpOkaVrWnjTrGOxuZ7YvdQQriNTnjGOM/eBx6CvOa734k+MtI8RWulaZo0Vw1vpqFRPc/ffIAA5JJ4HJPU1weKAEopcUYoASilxRigBKKKKAAUtAFLxQAlJS0UAFFJRQAUUUUAFFFFABS0lFACkknJOTSUUUAFFFFABRRRQAUtJRQAuKKTNGaAFoozRQAUUYooASlpKKAFpKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKBRRQAtFJRmgBaKMmigBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAXiikooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z";

// ===== REAL DATA (from your Excel files) =====
const _I=[["Zamzam Brothers","@zamzam_brothers_official","Business & Tech","Dubai","Pakistani","24.2M","4.8M","78.0M","107.0M",0.2,"Mega"],["Huda Kattan","@hudabeauty","Beauty","Dubai","Iraqi-American","57.5M","4.2M","4.1M","65.8M",1.8,"Mega"],["Supercar Blondie (Alex Hirschi","@supercarblondie","Luxury & Cars","Dubai","Australian","17.8M","12.0M","19.5M","49.3M",2.1,"Mega"],["Nancy Ajram","@nancyajram","Music & Entertainment","Dubai","Lebanese","40.0M","5.2M","3.8M","49.0M",2.8,"Mega"],["Myriam Fares","@myriamfares","Music & Entertainment","Dubai","Lebanese","34.0M","8.5M","4.2M","46.7M",3.8,"Mega"],["Noor Stars (Noor Naim)","@noorstars","Lifestyle & Entertainm","Dubai","Iraqi","17.6M","7.2M","19.0M","43.8M",4.8,"Mega"],["AboFlah","@aboflah","Gaming & Comedy","Dubai","Saudi","1.8M","7.6M","27.0M","36.4M",6.8,"Mega"],["Narin Amara (Narins Beauty)","@narins_beauty","Beauty & Lifestyle","Dubai","Kurdish-Iraqi","11.2M","7.5M","14.4M","33.1M",3.2,"Mega"],["Lana Mohd","@lana_mohd89","Beauty & Fashion","Dubai","Syrian","13.4M","12.9M","6.2M","32.5M",6.2,"Mega"],["Anas Marwah (Anasala Family)","@anasmarwah","Family & Lifestyle","Dubai","Syrian-Canadian","5.6M","3.2M","23.0M","31.8M",6.2,"Mega"],["Anatoly","@anatoly_pranks","Comedy & Pranks","Dubai","Russian","580K","22.1M","8.5M","31.2M",7.2,"Mega"],["Ishita Gupta II9","@ishitaguptaii9","Entertainment & Media","Dubai","Indian","13.1M","9.7M","6.9M","29.7M",2.2,"Mega"],["Pamela Eid","@pamelaeid","Fashion & Culture","Dubai","Lebanese","11.5M","12.5M","5.3M","29.3M",2.4,"Mega"],["Dina Saeva","@dinasaeva","Beauty & Fashion","Dubai","Russian","1.8M","24.7M","980K","27.5M",5.8,"Mega"],["Tamer Hosny","@tamerhosny","Music & Lifestyle","Dubai","Egyptian","19.8M","3.8M","2.1M","25.7M",2.8,"Mega"],["Joelle Mardinian","@joellemardinian","Beauty & TV","Dubai","Lebanese","21.7M","2.1M","1.8M","25.6M",2.4,"Mega"],["Farah Al Mutairi","@farahalmutairi","Entertainment & Comedy","Dubai","Kuwaiti","12.6M","11.8M","1.2M","25.6M",2.4,"Mega"],["Haifa Wehbe","@haifawehbe","Music & Entertainment","Dubai","Lebanese","19.8M","3.2M","1.8M","24.8M",3.2,"Mega"],["Hamdan bin Mohammed (Fazza)","@faz3","Royalty & Culture","Dubai","Emirati","17.4M","5.8M","980K","24.2M",8.5,"Mega"],["Mai Omar","@maiomar_","Lifestyle & Entertainm","Dubai","Egyptian","17.5M","4.2M","2.1M","23.8M",4.8,"Mega"],["Abdu Rozik","@abdu_rozik","Entertainment & Music","Dubai","Tajik","8.1M","12.0M","3.5M","23.6M",0.7,"Mega"],["Ossy Marwah","@ossymarwah","Comedy & Family","Dubai","Syrian-Canadian","9.1M","4.1M","10.0M","23.2M",5.8,"Mega"],["Balqees Fathi","@balqees","Music & Culture","Dubai","Yemeni","16.0M","3.8M","2.1M","21.9M",4.2,"Mega"],["Bessan Ismail","@bessan_esmail","Music & Entertainment","Dubai","Palestinian","980K","19.2M","1.2M","21.4M",6.5,"Mega"],["Nayla Al Qasimi Jr8","@naylaalqasimijr8","Travel & Adventure","Dubai","Emirati","13.5M","3.5M","4.2M","21.2M",2.2,"Mega"],["Saad Lamjarred","@saadlamjarred","Music & Lifestyle","Dubai","Moroccan","15.5M","3.2M","1.8M","20.5M",3.5,"Mega"],["Balqees Fathi","@balqeesfathi","Music & Beauty","Dubai","Yemeni-Emirati","15.9M","3.2M","1.2M","20.3M",2.8,"Mega"],["Yasmine Sabri","@yasmine.sabri","Fashion & Entertainmen","Dubai","Egyptian","15.2M","3.2M","1.8M","20.2M",4.5,"Mega"],["Leen Mohd","@leen_mohd98","Beauty & Fashion","Dubai","Syrian","4.2M","9.8M","5.8M","19.8M",5.9,"Mega"],["Ahlam (Ahlam_Al_Shamsi)","@ahlam_official","Music & Entertainment","Dubai","Emirati","15.3M","2.8M","1.2M","19.3M",2.8,"Mega"],["Ahlam Al Shamsi","@ahlamalshamsi","Music & Culture","Dubai","Emirati","15.4M","2.8M","980K","19.2M",0.6,"Mega"],["Pia Wurtzbach","@piawurtzbach","Lifestyle & Beauty","Dubai","Filipino","14.8M","3.2M","1.1M","19.1M",0.4,"Mega"],["Ghaith Marwan","@ghaith_marwan","Comedy & Entertainment","Dubai","Jordanian","9.3M","6.5M","3.2M","19.0M",6.1,"Mega"],["Mo Vlogs","@mo_vlogs_","Lifestyle & Entertainm","Dubai","Iranian","4.5M","2.8M","11.3M","18.6M",4.5,"Mega"],["Cyrine Abdelnour","@cyrine.abdelnour","Music & Entertainment","Dubai","Lebanese","14.0M","2.8M","1.2M","18.0M",2.5,"Mega"],["Cyrine Abdelnour","@cyrineabdelnour","Music & Entertainment","Dubai","Lebanese","14.0M","2.1M","1.2M","17.3M",3.2,"Mega"],["Salma Amrani III1","@salmaamraniiii1","Travel & Lifestyle","Dubai","Moroccan","10.2M","5.9M","1.1M","17.2M",1.7,"Mega"],["Missdouaa","@missdouaa.officiel","Fashion & Lifestyle","Dubai","Moroccan","1.2M","14.8M","580K","16.6M",6.2,"Mega"],["Hayla Ghazal (HaylaTV)","@haylagh","Lifestyle & Entertainm","Dubai","Jordanian","2.0M","5.1M","9.4M","16.5M",5.2,"Mega"],["Ziba Gulley","@zibagulley","Travel & Lifestyle","Dubai","Afghan","420K","15.9M","180K","16.5M",6.8,"Mega"],["Elissa","@elissazkh","Music & Entertainment","Dubai","Lebanese","12.5M","2.8M","1.2M","16.5M",3.5,"Mega"],["Assala Nasri","@assalanasri","Music & Culture","Dubai","Syrian","13.0M","2.5M","980K","16.5M",2.8,"Mega"],["Abdul Rahman Al-Awadhi","@abduuu_21","Comedy & Entertainment","Dubai","Emirati","8.5M","6.5M","1.2M","16.2M",5.8,"Mega"],["Jumana Khan","@jumana","Fashion & Comedy","Dubai","Jordanian","5.8M","9.2M","1.2M","16.2M",4.5,"Mega"],["Mona Zaki","@monazkiofficial","Entertainment & Lifest","Dubai","Egyptian","12.5M","2.5M","1.2M","16.2M",3.8,"Mega"],["Anas Elshayib","@anas_alshayb","Lifestyle & Comedy","Dubai","Mixed","7.0M","8.2M","950K","16.1M",5.5,"Mega"],["Ragheb Alama","@raghebalamaofficial","Music & Lifestyle","Dubai","Lebanese","12.8M","2.1M","1.1M","16.0M",3.2,"Mega"],["Jumana Khan","@jumanakhan","Lifestyle & Fashion","Dubai","Palestinian","5.8M","9.2M","850K","15.8M",5.8,"Mega"],["Lojain Omran","@lojain_omran","Media & Entertainment","Dubai","Saudi","12.1M","1.8M","980K","14.9M",3.2,"Mega"],["Nof Al Marri","@nof","Wildlife & Environment","Dubai","Emirati","11.5M","2.2M","980K","14.7M",1.5,"Mega"]];

const _S=[["EMIC","Factory","Alaa","Later","A"],["Sammy 1","3rd Party","Sammy","Later","D"],["Sammy 2","3rd Party","Sammy","Later","D"],["Sammy 3","3rd Party","Sammy","Later","D"],["Alami Deal","Factory","Alami","Later","D"],["Nestle","Strategic","Nada","Later","A"],["Nestle","Strategic","Nada","Later","A"],["P & G","Strategic","Leen","Later","L"],["Nestle","Strategic","Nada","Later","A"],["Nestle","Strategic","Cecilia","Later","L"],["Abdalla","Design","Abdulla","Later","A"],["Playstation","Strategic","Waleed","Later","D"],["Nestle","Strategic","Cecilia","Later","A"],["Majid Moh,.","3rd Party","Sammy","Later","D"],["Garage","Tech.","Khaled","Later","D"],["Podcast","3rd Party","Waleed","Later","D"],["Firmac Industries","Factory","Ali","Later","A"],["Hind","E Commerce","Hind","Later","A"],["The IML Group","Agency","Cecilia","Later","A"],["Nestle Nido","Strategic","Sayed","Later","A"],["Nestle","Strategic","Nada","Later","A"],["Zamat Global","F & B","Cnado","Later","D"],["Soona","3rd Party","Soona","Later","D"],["The IML Group (4)","Strategic","Cecilia","Later","D"],["The IML Group (3)","Strategic","Cecilia","Later","A"],["Walid 2","3rd Party","Waleed","Later","D"],["The IML Group (2)","Strategic","Cecilia","Later","A"],["The IML Group (5)","Strategic","Cecilia","Later","D"],["Syed","Agency","Syed","Later","D"],["Aster","Hospitals","Soona","Later","A"],["Nestle May 30 & 31","Strategic","AZZAM","Later","A"],["SUWMUS 2","E Commerce","HIBA","Later","D"],["Nestle Hiba","Strategic","AZZAM","Later","A"],["Nine71","Agency","Anum","Later","A"],["Nestle Hiba","Strategic","AZZAM","Later","A"],["Nine71","Agency","Anum","Later","A"],["The IML Group (6)","Strategic","Cecilia","Later","A"],["The IML Group (7)","Strategic","Cecilia","Later","A"],["The IML Group (8)","Strategic","Cecilia","Later","A"],["Nestle 27","Strategic","AZZAM","Later","A"],["Nestle Nada","Strategic","Nada","Later","A"],["ALZEER Project","Start up","Abdalla","Later","D"],["Nestle 24 Nada","Strategic","Nada","Later","A"],["Nestle 26 ED Sheeran","Strategic","AZZAM","Later","A"],["SUWMUS","E Commerce","HIBA","Later","A"],["Nestle Azzam Photos","Strategic","AZZAM","Later","A"],["Nestle Store","Strategic","AZZAM","Later","A"],["Nestle Team","Strategic","AZZAM","Later","A"],["Nestle (AD - DXB)","Strategic","Nada","Later","A"],["Nestle Edits (H)","Strategic","Azam","Later","A"],["Jalsa","Furniture","Israa","Later","D"],["Aseel Al Challabi","SME","Aseel","Later","P"],["Tarawnee","SME","Tarawnee","Later","P"],["Nestle AI H","Strategic","Heba","Later","P"],["Nestle AI G","Strategic","Gylene","Later","P"],["Nestle H","Strategic","Azam","Later","P"],["24 GOLD HOTEL","Hotels","TBC","Later","P"],["25hours Hotel","Hotels","TBC","Later","P"],["57 SAFARI","Hotels","TBC","Later","P"],["ABJAD CROWN HOTEL","Hotels","TBC","Later","P"],["ADAGIO PREMIUM","Hotels","TBC","Later","P"],["ADAGIO PREMIUM","Hotels","TBC","Later","P"],["ADDRESS BEACH RESORT","Hotels","TBC","Later","P"],["ADDRESS CREEK HARBOUR","Hotels","TBC","Later","P"],["ADDRESS DOWNTOWN","Hotels","TBC","Later","P"],["ADDRESS DUBAI MALL","Hotels","TBC","Later","P"],["ADDRESS MONTGOMERIE","Hotels","TBC","Later","P"],["Admiral Plaza Hotel","Hotels","TBC","Later","P"],["Al Bandar Rotana","Hotels","TBC","Later","P"],["AL HABTOOR GRAND RESORT","Hotels","TBC","Later","P"],["AL HABTOOR PALACE","Hotels","TBC","Later","P"],["AL HABTOOR POLO RESORT","Hotels","TBC","Later","P"],["Al Jaddaf Rotana","Hotels","TBC","Later","P"],["AL KHALEEJ PALACE","Hotels","TBC","Later","P"],["Al Khoory Hotels","Hotels","TBC","Later","P"],["Al Maha Desert Resort & Spa","Hotels","TBC","Later","P"],["AL MANAR GRAND HOTEL","Hotels","TBC","Later","P"],["AL SARAB HOTEL","Hotels","TBC","Later","P"],["Al Seef Heritage Hotel","Hotels","TBC","Later","P"],["aloft Hotels","Hotels","TBC","Later","P"],["aloft Hotels","Hotels","TBC","Later","P"],["aloft Hotels","Hotels","TBC","Later","P"],["aloft Hotels","Hotels","TBC","Later","P"],["aloft Hotels","Hotels","TBC","Later","P"],["Amwaj Rotana","Hotels","TBC","Later","P"],["ANANTARA DOWNTOWN DUBAI HOTEL","Hotels","TBC","Later","P"],["ANANTARA THE PALM DUBAI RESORT","Hotels","TBC","Later","P"],["ANANTARA WORLD ISLANDS RESORT","Hotels","TBC","Later","P"],["ANDAZ DUBAI THE PALM","Hotels","TBC","Later","P"],["ARABIAN BOUTIQUE HOTEL","Hotels","TBC","Later","P"],["Arabian Courtyard Hotel & Spa","Hotels","TBC","Later","P"],["Arabian Park Dubai","Hotels","TBC","Later","P"],["ARMANI HOTEL DUBAI","Hotels","TBC","Later","P"],["Ascot Hotel","Hotels","TBC","Later","P"],["Asiana Grand Hotel","Hotels","TBC","Later","P"],["Asiana Hotel","Hotels","TBC","Later","P"],["ATANA HOTEL","Hotels","TBC","Later","P"],["ATLANTIS, THE PALM DUBAI","Hotels","TBC","Later","P"],["ATLANTIS, THE ROYAL DUBAI","Hotels","TBC","Later","P"],["AURIS BOUTIQUE HOTEL APARTMENTS","Hotels","TBC","Later","P"],["AVANI Deira Dubai","Hotels","TBC","Later","P"],["AVANI Ibn Battuta Dubai","Hotels","TBC","Later","P"],["AVANI Palm View Dubai","Hotels","TBC","Later","P"],["AVENUE HOTEL DUBAI","Hotels","TBC","Later","P"],["BAB AL SHAMS","Hotels","TBC","Later","P"],["Nestle UAE (Nada 3 Doc)","Strategic","Nada","Later","A"],["Hind","TBC","Hind","Later","L"],["Nestle Hiba 14","Strategic","Heba","Later","D"],["Hind (N)","TBC","Hind","Later","D"],["Asharq","Media","Bader","Later","A"],["Sammy (A)","TBC","Sammy","Later","L"],["Sammy (B)","TBC","Sammy","Later","L"],["Nestle UAE 8625","Strategic","AZZAM","Later","A"],["Nestle UAE   (82525)","Strategic","Azam","Later","A"],["EMIR","F & B","Madina","Later","A"],["Eman Syrian Deal","TBC","TBC","Later","D"],["VISA","Strategic","Ahmed","Later","P"],["Arabian Oud New Proj.","Perfumes","Raed","Later","D"],["Neslte UAE","TBC","TBC","Later","A"],["Nestle UAE (25 & 26)","Strategic","Nada","Later","A"],["Hiba","E Commerce","Hiba","Later","D"],["Waleed Proj 1","3rd Party","Waleed","Later","D"],["Fitvision","Interior Design","Abdalla","Later","A"],["Seven Century Real Estat","Real Estate","Naghmah","Later","F"],["Arabian Oud","Perfumes","Raed","Later","F"],["Mezura","E Commerce","Reem","Later","D"],["Ahmed Nidal MV","Individual","Ahmad Nidal","Later","D"],["Hassan (Reem)","Real Estate","Hassan","Later","F"],["Ayad Brother","Individual","Ayad","Later","D"],["Tox Music Video","Individual","Tox","Later","D"],["Maisa (Kamira)","Beauty","Maisa","Later","F"],["Amazon","Strategic","Ahmad","Later","F"],["Daniel","Agency","Daniel","Later","D"],["Skafi","Agency","Skafi","Later","D"],["Fahed (MAF)","Strategic","Fahed","Later","F"],["Emaar","Strategic","Bader","Later","F"],["VISA","Strategic","Ahmed","Later","F"],["P&G","Strategic","Shams","Later","F"],["Arif (Diamond)","Medical","Arif","Later","F"],["Camels","Connections","Camels","Later","F"],["Meera (Nissan)","Strategic","Meera","Later","D"],["Lara Eng.","Personal","Lara","Later","D"],["Alami / Connection","Connections","Alami","Later","F"],["AV PRO DWC LLC","TBC","Grace","Later","D"],["Akash","TBC","Akash","Later","D"],["Imagenatioon","Strategic","Lana","Later","D"],["Dar Linda Beauty Center","Beauty","Bader/Linda","Later","F"],["Mazen (Beiruti)","Personal","Alami","Later","F"],["Omar (Saudi)","Strategic","Omar","Later","F"],["Mariam Influencers","3rd Party","Mariam","Later","F"],["Al Sharq","Media","Bader","Later","F"],["ALMAS DIAMOND SERVICES DMCC","Jewllery","JJ/Ravi","Later","A"],["Skafi","3rd Party","Waleed","Later","D"],["Alankar Gems","Jewllery","Nathan","Later","D"],["Nestle UAE AI & CGI & Podcast","Strategic","Azam","Later","F"],["Sephora","Strategic","TBC","Later","F"],["Ounass","Strategic","TBC","Later","F"],["Sammy","TBC","TBC","Later","D"],["IQ Auto","TBC","TBC","Later","D"],["Nathan New Project 2","TBC","TBC","Later","D"],["Simurgh Cars","TBC","TBC","Later","D"],["Trophie (ZAID)","TBC","Zaid","Later","D"],["Al Shayf Damascus","TBC","TBC","Later","D"],["Waleed Proj 2","3rd Party","Waleed","Later","D"],["Sammy (Padel)","TBC","Sammy","Later","D"],["Awani","TBC","Salem","Later","D"],["Apparel Group","Strategic","Jackielyn","Later","F"],["ALMAS DIAMOND SERVICES DMCC","Jewllery","Ravi","Later","A"],["Deloitte","Strategic","TBC","Later","F"],["57 Safari Dubai","Safar","TBC","Later","F"],["Al Habtoor Hospitality","Group","TBC","Later","F"],["Cosmic Kitchen","F&B","Nikhil","Later","F"],["Sips N Taps","F&B","Nikhil","Later","F"],["Nestle UAE","Strategic","Azam","Later","A"],["Nestle UAE (Untold Festival 6/9)","Strategic","Azam","Later","A"],["Hind New Project","Agency","Hind","Later","D"],["Zayn","Strategic","Ali","Later","F"],["Hind 3","Agency","Hind","Later","A"],["Sammy","Agency","Sammy","Later","D"],["Hiba","Infliuencer","Hiba","Later","A"],["Sammy","Agency","Sammy","Later","D"],["Sammy Clinics","Agency","Sammy","Later","D"],["Hind","Agency","Hind","Later","A"],["Heba","Influencer","Heba","Later","A"],["Nestle UAE","Strategic","Azam","Later","A"],["Ali (SM Project)","Personal","Ali","Later","A"],["Farm Project (Ali Al Ketbi)","Farm","Ali Ketbi","Later","A"],["Nestle UAE (Kite Beach)","Strategic","Azam","Later","D"],["Sammy Majid","Agency","Sammy","Later","D"],["Nestle Edits","Strategic","Azam","Later","A"],["Fatoom Uncle","TBC","Fatoom","Later","F"],["Beyonf Fizz","TBC","Ola","Later","F"],["SB Media Group","TBC","TBC","Later","F"],["Elysian","TBC","Majd","Later","F"],["Juns Dubai","TBC","Daryl","Later","F"],["Cycle Challenge","TBC","Ahmed","Later","F"],["VGH","TBC","Tanaz","Later","F"],["Badoni Shubham","TBC","Shubham","Later","F"],["Meat Max DXB","TBC","Abdullah","Later","F"],["Guild Team","TBC","TBC","Later","F"],["Sunset Hospitality","TBC","Mohammed","Later","F"],["Real Estate (Antonella)","Real Estate","Antonella","Later","U"],["Dr.stretch UAE","Therapy","Grendel","Later","U"],["Real Estate Agent 1","Real Estate","TBC","Later","F"],["Real Estate Agent 2","Real Estate","TBC","Later","F"],["HAK","TBC","Hakeem","Later","A"],["The IML Group","TBC","TBC","Later","F"],["Zamat Global","TBC","TBC","Later","F"],["Soona","TBC","TBC","Later","D"],["Waleed 2026","TBC","TBC","Later","F"],["Syed","TBC","TBC","Later","D"],["ALZEER Project","TBC","TBC","Later","F"],["Jalsa","TBC","TBC","Later","F"],["EMIR","TBC","TBC","Later","F"],["Arabian Oud New Proj.","TBC","TBC","Later","D"],["Fitvision","TBC","TBC","Later","F"],["Skafi","TBC","TBC","Later","F"],["AV PRO DWC LLC","TBC","TBC","Later","F"],["Akash","TBC","TBC","Later","F"],["ALMAS DIAMOND SERVICES DMCC","TBC","TBC","Later","F"],["Skafi","TBC","TBC","Later","D"],["Sammy","TBC","TBC","Later","F"],["IQ Auto","TBC","TBC","Later","F"],["Simurgh Cars","TBC","TBC","Later","F"],["Al Shayf Damascus","TBC","TBC","Later","F"],["Awani","TBC","TBC","Later","F"],["Sammy","TBC","TBC","Later","D"],["The IML Group","TBC","TBC","Later","D"],["Zamat Global","TBC","TBC","Later","D"],["Nestle (Lulu 2026)","TBC","Azam","Later","A"],["Xaya","TBC","Xaid & Yazan","Later","F"],["GITEX Event Client","TBC","TBC","Later","F"],["Hayatt Regency","TBC","TBC","Later","F"],["Nissan","TBC","TBC","Later","F"],["Rivage (Lana/HAK)","TBC","Lana","Later","L"],["Reef Healthy Bread","TBC","TBC","Later","F"],["Rivage (Lana)","TBC","TBC","Later","F"],["MOF Perfume","TBC","TBC","Later","F"],["Taj","Hotels","TBC","Later","F"],["Luxury Chocolate","F&B","TBC","Later","A"],["Italian Thingy","Strategic","TBC","Later","F"],["Nestle IPV","Strategic","Azzam","Later","A"],["Nestle Maggi","Strategic","Azzam","Later","A"],["Naggam Pro","Beauty","Naggam","Later","F"],["Alaa Hamdan","SME","Alaa","Later","D"],["Emaar | Najjar","Strategic","Najjar","Later","F"],["Farm Up Sell","Farm","Rashed","Later","F"],["Lynk & Co","Strategic","Hakeem","Later","F"],["Khonav","Fashion","Khonav","Later","A"],["Hind (HBMM)","Agency","Shevrillie","Later","F"],["Studex","Fashion","TBC","Later","F"],["Lara Collab.","TBC","TBC","Later","F"],["Maisa","TBC","TBC","Later","F"],["6th Street","TBC","TBC","Later","F"],["HBMM (All Projects)","TBC","TBC","Later","F"],["Amit","TBC","TBC","Later","F"],["Ounass","TBC","TBC","Later","F"],["Hiba Mahfouz","TBC","TBC","Later","F"],["Waleed New","TBC","TBC","Later","F"],["Arabian Oud","TBC","TBC","Later","F"],["Hakeen Wealia","TBC","TBC","Later","F"]];

const _F=[["Kris Kross","F/B",2500,2500],["Leila","F/B",2500,2500],["Wedding","Events",4700,4700],["Veneto","Clinic",3500,3500],["Emic","Factory",7500,7500],["Event 1","Events",1400,1400],["Falafel Frayha","F/B",4000,4000],["Proposal","Events",600,600],["Event 2","Events",700,700],["Event 3","Events",900,900],["AfrobySara","Influencer",850,850],["Emir SM","F/B",4500,4500],["Emir Production","F/B",5000,5000],["Falafel Frayha Dec","F/B",4000,4000],["Yacht Event","Events",4000,4000],["138 Dubai","E Commerce",4000,4000],["Lahun","F/B",2500,2500],["Expo Saudi","Events",1500,1500],["Amira Shoot","Start Up",850,850],["Emir Rest. Jan","F/B",4500,4500],["Jude & Khateeb Eng.","Events",4500,4500],["Leila","F/B",2800,2800],["Kris Kross Lebanon","F/B",1500,1500],["Saxo Bank","Events",6000,6000],["Emir SM","F/B",4500,4500],["Republic","F/B",7000,7000],["MAF","Retail",31000,31000],["Brow & Lash","Start Up",2000,2000],["AfrobySara","Influencer",2000,2000],["Orderosa","F/B",3000,3000],["AfrobySara","Influencer",2000,2000],["EMIR SM","F/B",4500,4500],["MAF SSF","Retail",10500,10500],["Intisar","Influencer",1000,1000],["Point Group","F/B",5000,5000],["Howhaus","Start Up",2500,2500],["Hilton","Hotels",4500,4500],["NFT Project","Influencer",2000,2000],["Lushi","Start Up",1000,1000],["La Hun 2","F/B",2500,2500],["Ounass","Retail",34000,34000],["Raw Content (Lushi)","Start Up",300,300],["Palesta","Start Up",5250,5250],["P&G Event","Events",3700,3700],["P&G Event","Events",4000,4000],["Ahmed Nidal","Music Video",1800,1800],["MAF 1","Retail",3700,3700],["MAF 2","Retail",3700,3700],["MAF 3","Retail",3700,3700],["P&G Edit","Events",1300,1300],["Wonderbox","Start Up",2000,2000],["MAF 4","Retail",4500,4500],["MAF 5","Retail",5750,5750],["NABD","Application",20800,20800],["EVA","Start Up",25500,25500],["TRENDI","E Commerce",950,950],["Mokhtar Al Safadi","Beauty Salon",1750,1750],["Surface Cloud","Start Up",5000,5000],["Saxo Bank","Events",2250,2250],["Wonderbox","Start Up",3350,3350],["EVA","Start Up",7850,7850],["EVA","Start Up",17600,17600],["Al Safadi / Mayaas","F/B",1850,1850],["TBF","Start Up",5500,5500],["Hiba Al Hamadi","Influencer",1100,1100],["Palesta","Start Up",440,440],["MS","Beauty Salon",12200,12200],["Saxo Bank","Events",1400,1400],["Al Safadi / WC","F/B",1650,1650],["Hiba Al Hamadi","Influencer",1100,1100],["Sammy/Hatim Iraqi","Influencer",1850,1850],["Jan's Noodles","F/B",2500,2500],["Alsafadi","F/B",1700,1700],["LQ","E Commerce",1300,1300],["Starzplay","Events",4850,4850],["AL Safadi","F/B",1700,1700],["HA","Influencer",1100,1100],["Strazplay","Events",500,500],["HA","Influencer",1100,1050],["Melia","Flowers",1625,1625],["HA","Influencer",1100,1100],["Trendi","E Commerce",1100,1100],["Al Saffadi","F/B",1700,1700],["Al Saffadi","F/B",1700,1700],["HA","Influencer",1850,1850],["Melia","Flowers",1650,1650],["YOU EXPERIENCE LTD","Events",10300,10300],["Oregal & Chef Eyad","F/B",3000,3000],["Jibli","Start Up",8750,8748],["Kamira","Start Up",15750,15750],["Jibli","Start Up",8750,8748],["Zara & Rose","Start Up",1900,1900],["EMIR","F/B",3250,3250],["Al Saffadi","F/B",3250,3250],["SUWMUS","Start Up",1050,1050],["Nestle","Strategic",3800,3800],["Emic","Factory",9800,9800],["Nestle","Strategic",5000,5000],["Nestle","Strategic",4700,4700],["Nestle","Strategic",9500,9500],["Fitvision Interior Des","Start Up",14950,14950],["The IML Group","Agency",14250,14250],["Firmac","Factory",13450,13450],["Nestle","Strategic",4695,4695],["The IML Group 2","Agency",9750,9750],["The IML Group 3","Agency",15850,15850],["Nestle Nido","Agency",3500,3500],["Nestle","Agency",2250,2250],["Aster","Health",2900,2900],["The IML Group 6","Agency",5250,5250],["The IML Group 7","Agency",5000,5000],["Nine71","Agency",78250,78250],["Nine72","Agency",5000,5000],["Nestle Store","Agency",600,600],["The IML Group 8","Agency",5250,5250],["Nestle (Splendid Trave","Agency",6156,6156],["Nestle (ED Sheeran)","Strategic",5850,5850],["Nestle Photos","Strategic",1050,1050],["Nestle","Strategic",3500,3500],["Nestle","Strategic",4350,4350],["Hind","Start Up",250,250],["Nestle (UCT)","Strategic",1350,1350],["Nestle Office Shoot","Strategic",2600,2600],["Nestle (Nada)","Strategic",3350,3350],["Nestle 2 Edits","Strategic",1950,1950],["Asharq","Media",2500,2500],["Nestle UAE (8625)","Strategic",8350,8350],["Nestle UAE(82525)","Strategic",3350,3350],["Nestle UAE (Nada 3 Doc","Strategic",3650,3650],["EMIR Restaurant","F & B",5950,5950],["Nestle UAE (25&26)","Strategic",3850,3850],["Nestle UAE","Strategic",2520,2520],["Fitvision Interior Des","Interior Des",5250,5250],["Nestle UAE (RAK)","Strategic",2350,2350],["ALMAS DIAMOND SERVICES","Jewllery",4500,4500],["ALMAS DIAMOND SERVICES","Jewllery",2250,2250],["Nestle Untold","Strategic",4950,4950],["Nestle Dubai Hills Mal","Strategic",6150,6150],["Hiba Al Hamadi","Influencer",500,500],["Hind","Agency",2500,2500],["Nestle UAE (DHM)","Strategic",2250,2250],["Nestle UAE","Agency",1350,1350],["Ali Rahmoun (P.B)","Personal",2250,2250],["Organic Rashed Farm","Farm",8500,8500],["HAK (Oura)","Events",3100,3100],["Nestle UAE (Lulu Barsh","Strategic",2750,0],["Nestle UAE (IP)","Strategic",2000,0],["Nestle UAE (Feerjan Fe","Strategic",2650,0],["Zari & Rose","E Commerce",500,500],["Luxury Chocolate","F & B",2500,2500]];

const _Q=[["SLF","Dropped"],["Wedding","Awarded"],["Veneto","Awarded"],["EMIC","Awarded"],["Milk Bakery","Dropped"],["TGB","Dropped"],["Abaya","Dropped"],["Abaya","Dropped"],["Football Tournment","Dropped"],["Zamalooni Abaya","Dropped"],["Epitome Lounge","Dropped"],["Epitome Lounge","Dropped"],["2 Events","Awarded"],["Mario","Awarded"],["Freeha","Awarded"],["138","Dropped"],["Event","Awarded"],["Hanayen","Dropped"],["Mullenlowe MENA FZ LLC (Zahi","Dropped"],["Mullenlowe MENA FZ LLC (Moe)","Dropped"],["Woof Bakery Social Media","Dropped"],["Sparklebow & Co","Dropped"],["Mosaic Nail and Beauty Spa","Dropped"],["Mullenlowe MENA FZ LLC Editi","Dropped"],["Fares & Reem","Dropped"],["Veneto Clinic","Dropped"],["Emir Restaurant","Awarded"],["Emir Restaurant","Awarded"],["La Hun Middle East","Awarded"],["Alayniah Company","Awarded"],["Engagment A","Awarded"],["Engagment B","Awarded"],["MAF","Awarded"],["MAF","Awarded"],["GMG: Beauty Bar","Dropped"],["THAT Concept Store","Dropped"],["Republic ADDA Bar & Lounge","Awarded"],["HowHaus","Dropped"],["Leila","Awarded"],["KK","Awarded"],["Saxo Bank","Awarded"],["AMB Electronics","Dropped"],["AMB Electronics","Dropped"],["Healthy Home Me","Dropped"],["Pariz Bakery Production","Dropped"],["Pariz Bakery SM","Dropped"],["Mideasaidcoach","Dropped"],["Kids Lab","Dropped"],["138","Dropped"],["138","Dropped"],["French Café","Dropped"],["French Café","Dropped"],["AL FAKHER","Dropped"],["Veneto Clinic","Dropped"],["Butter Dessert Salon SM","Dropped"],["Butter Dessert Salon","Dropped"],["Kellogg","Dropped"],["Maria","Dropped"],["HowHaus","Awarded"],["Brow & Lash DXB","Awarded"],["AfrobySara","Awarded"],["MAF SSF","Awarded"],["Orderosa","Awarded"],["AfrobySara","Awarded"],["MAF","Awarded"],["Intissar El Sousi","Awarded"],["Redtag","Dropped"],["Point Group","Awarded"],["Mancera","Dropped"],["Redtag 2","Dropped"],["Al Seef 1","Awarded"],["Palesta","Dropped"],["Mohammed Al Wadiya","Awarded"],["Ounass","Awarded"],["Standout","Dropped"],["La Hun Middle East","Awarded"],["Loushi","Awarded"],["Yuniu Jewels","Dropped"],["Yuniu Jewels","Dropped"],["Dunes","Dropped"],["138","Dropped"],["Surface Cloud","Awarded"],["Rotai","Dropped"],["P&G","Awarded"],["Tutoring Club","Dropped"],["APCO Worldwide","Dropped"],["Beit Em Noor","Dropped"],["Mohammed Al Mheri Boutique","Dropped"],["Dana Owais’s Podcast","Dropped"],["L'Occitane 1","Dropped"],["L'Occitane 2","Dropped"],["Block 92","Dropped"],["Shell Designs Abaya Store Pr","Dropped"],["Shell Designs Abaya Store SM","Dropped"],["P&G","Awarded"],["Ahmed Nidal","Awarded"],["MAF","Awarded"],["Aldo","Dropped"],["Leila 1","Awarded"],["KrikKros Lebanon 1","Awarded"],["WonderBox","Awarded"],["MAF","Awarded"],["P&G Edit","Awarded"],["MAF","Awarded"],["971","Dropped"],["Hampton by Hilton Hotel","Dropped"],["Nabd","Awarded"],["Eva Trade","Awarded"],["Palesta P.2","Dropped"],["Veneto Clinic","Dropped"],["Haydar","Dropped"],["TBF","Awarded"],["TRENDI","Awarded"],["MAF","Lost"],["Saxo Bank","Awarded"],["MAF","Lost"],["Boksha.","Dropped"],["Boksha.","Dropped"],["Mokhtar Safadi","Awarded"],["MAF","Lost"],["Eva","Awarded"],["WonderBox","Awarded"],["Ferrero Rocher","Lost"],["EVA LS","Awarded"],["AL Safadi Rest.","Awarded"],["Mokhtar Safadi","Dropped"],["Palesta","Dropped"],["Garage Car","Dropped"],["Hilton Shared Service Center","Dropped"],["Hilton Shared Service Center","Dropped"],["NABD 2","Dropped"],["Hiba AL Hamadi","Awarded"],["Mokhtar Safadi","Awarded"],["NABD 3","Dropped"],["Farah Hamzeh","Dropped"],["AL Safadi Rest.","Awarded"],["Orwah","Awarded"],["Jan’s Noodles Restuarant.","Awarded"],["Hiba AL Hamadi","Awarded"],["Bedoon Essm","Dropped"],["SIJA'S BAKES","Dropped"],["3rd Party Ammak","Dropped"],["Starzplay","Awarded"],["AL Safadi Rest.","Awarded"],["Aseel 1","Dropped"],["Aseel 2","Dropped"],["Aseel 3","Dropped"],["KAMIRA","Awarded"],["Lamya","Awarded"],["Mukhabbat","Dropped"],["Soldaire Saloon","Dropped"],["AL Safadi Rest.","Awarded"],["Hiba AL Hamadi Friend","Dropped"],["Audi","Dropped"],["Royal Group","Dropped"],["Chef Umut","Dropped"],["MAF FC","Lost"],["MAF SSF","Dropped"],["Flat White","Dropped"],["Loris","Dropped"],["Dave's Chicken","Dropped"],["Central Paddle","Dropped"],["Sultan","Dropped"],["72 Hours Hotel","Dropped"],["MELIA","Awarded"],["Day To Day","Dropped"],["AAS/SA","Dropped"],["AL Safadi Rest.","Awarded"],["Pickiit","Dropped"],["AL Safadi Rest.","Awarded"],["Jibli","Awarded"],["You Experience (UX)","Awarded"],["HA","Awarded"],["Melia","Awarded"],["The Act Hotel","Dropped"],["Food 4 Me","Dropped"],["Marwan","Dropped"],["Strazplay","Dropped"],["Two Stores","Awarded"],["Wingo Go","Dropped"],["Chef Eyad","Dropped"],["Global Entrepreneurship Boot","Dropped"],["IPR Gorilla","Dropped"],["Purrple Orryx DWC LLC","Lost"],["Purrple Orryx DWC LLC","Lost"],["Gam Events","Dropped"],["Belcanto Restaurant","Dropped"],["Ameena’s Pink Series","Dropped"],["Shawerma Vibes","Dropped"],["Doc Barnet","Dropped"],["The Crumb Cafe","Dropped"],["Mr. Brisket","Dropped"],["Wild Paint House","Dropped"],["Ground Work","Dropped"],["Fritz","Dropped"],["Marwan","Dropped"],["MAF","Lost"],["Additiv","Lost"],["Doc Barnet (OTP)","Dropped"],["Doc Barnet","Dropped"],["Good Well","Dropped"],["Emir Restaurant","Awarded"],["Zari & Rose","Awarded"],["Al Safadi Rest","Awarded"],["Zara & Rose","Dropped"],["SAI Luxury Lifestyle","Dropped"],["Points Solutions","Dropped"],["SUWMUS","Awarded"],["Heba House","Dropped"],["971","Dropped"],["Nestle","Awarded"],["EMIC","Awarded"],["Nestle","Dropped"],["Nestle","Awarded"],["Nestle","Awarded"],["P&G","Dropped"],["Nestle","Lost"],["Firmac Industries","Awarded"],["Abdullah","Awarded"],["Nestle","Awarded"],["Playstation","Dropped"],["Waleed","Lost"],["Jalsa Design","Dropped"],["The IMP Group","Awarded"],["Waleed 2","Dropped"],["Nestle","Awarded"],["Zamat Global","Dropped"],["Soona","Dropped"],["Nestle Nido","Awarded"],["The IMP Group (2)","Awarded"],["The IMP Group (3)","Awarded"],["The IMP Group (4) - 5 Hours","Dropped"],["The IMP Group (5) - 10 Hours","Dropped"],["Syed","Dropped"],["Aster DM Healthcare","Awarded"],["Nestle Hiba","Awarded"],["Nine 71 (Dettol)","Awarded"],["The IML Group 6","Awarded"],["Hiba","Dropped"],["The IML Group 7","Awarded"],["Nestle Store","Awarded"],["Nestle Editing","Awarded"],["The IML Group 8","Awarded"],["Nine 71 (Dettol)","Awarded"],["Nestle","Awarded"],["Nestle","Awarded"],["HIND","Dropped"],["Nestle 1 (HIBA)","Dropped"],["Nestle 2 (Photos)","Awarded"],["Nestle 30 & 31","Awarded"],["Nestle 27","Awarded"],["Hind","Awarded"],["Fitvision","Dropped"],["Nestle (UCT)","Awarded"],["Nestle (Office Shoot)","Awarded"],["Nada (AD - Dubai)","Awarded"],["HIND (Noon)","Dropped"],["Nestle (Edits) (H)","Awarded"],["Sammy (A)","Dropped"],["Sammy (B)","Dropped"],["Fitvision Interior Design","Awarded"],["Asharq","Awarded"],["Nestle UAE","Awarded"],["Nestle UAE (82525)","Awarded"],["ImageNation","Dropped"],["Nestle UAE (Untold Festival ","Awarded"],["Lara Shahin","Dropped"],["Nestle UAE (Kite)","Dropped"],["Nestle UAE (Nada 3 Doc)","Awarded"],["Mezura","Dropped"],["Hart Bernstien","Dropped"],["Emir Restaurant","Awarded"],["AV PRO DWC LLC","Dropped"],["Akash","Dropped"],["Nestle (25,26)","Awarded"],["Waleed 1","Dropped"],["Waleed 2","Dropped"],["Waleed 3","Dropped"],["Almas Diamond Services (A)","Awarded"],["Alankar Jewellery","Dropped"],["IQ Auto","Dropped"],["Simurgh Cars","Dropped"],["Nestle UAE","Awarded"],["Al Shayf Damascus","Dropped"],["AINDI","Dropped"],["Almas Diamond Services (B)","Awarded"],["57 Safari Dubai","Dropped"],["Al Habtoor Hospitality","Dropped"],["Cosmic Kitchen","Dropped"],["Sips N Taps","Dropped"],["Nestle UAE (RAK)","Awarded"],["Nestle UAE (111325)","Awarded"],["Hind 3","Awarded"],["Hiba","Awarded"],["Sammy A)","Dropped"],["Sammy (B)","Dropped"],["Nestle UAE (Dubai Hills Mall","Awarded"],["Sammy (Majid)","Dropped"],["Sammy New Clinic Project","Dropped"],["Ali (SM Thingy)","Awarded"],["Nestle UAE (Edit)","Awarded"],["Ali Rahmoun (P.B)","Dropped"],["Organic Rashed Farm","Awarded"],["Dr.stretch UAE","Dropped"],["Playa Dubai","Pending"],["HAK","Awarded"],["Nestle (Lulu 2026)","Awarded"],["Nestle UAE (IPS)","Awarded"],["Nestle UAE (Ferjan Festival)","Awarded"],["Luxury Chocolate","Awarded"],["HBMM","Pending"],["Khonav","Awarded"],["Dr.stretch UAE","Pending"],["Alaa Hamdan","Dropped"],["Nagham Pro Beauty","Pending"]];
const _E=[["Bader (Fixed Salary & %)",1500],["Manoj",5000],["Indeed",250],["Extra Project Expenses",250],["Google WS (ABM)",300],["Google WS (DL)",100],["Shahid, Netflix, & YT",100],["Extras",250],["Marketing",200],["Online Subscriptions",500]];

// ===== PARSE DATA =====
const INF=_I.map(i=>({n:i[0],h:i[1],c:i[2],ci:i[3],na:i[4],ig:i[5],tt:i[6],yt:i[7],t:i[8],e:i[9],tier:i[10]}));
const SALES=_S.map(s=>({cl:s[0],v:s[1],sp:s[2],em:s[3],st:{A:"Awarded",D:"Dropped",L:"Lost",F:"Funnel",U:"Upside",C:"Commit",P:"Prospect"}[s[4]]||"Prospect"}));
const FIN=_F.map(f=>({cl:f[0],v:f[1],rev:f[2],pd:f[3],du:f[2]-f[3]}));
const QUOT=_Q.map(q=>({cl:q[0],st:q[1]}));
const EXP=_E.map(e=>({item:e[0],price:e[1]}));

// Stats
const S={
  rev:FIN.reduce((a,f)=>a+f.rev,0),
  paid:FIN.reduce((a,f)=>a+f.pd,0),
  due:FIN.reduce((a,f)=>a+f.du,0),
  pipe:{},qst:{},verts:{},topCl:{},
  inf:1047,contacts:9481,prop:242892,monthlyExp:_E.reduce((a,e)=>a+e[1],0),
  cats:{"Food & Beverage":880,"Restaurant":611,"Fashion & Products":588,"Hotel":423,"Government":294,"Industry / Factory":291,"Clinic / Healthcare":236,"Education":158,"Oil & Gas":129,"Sports & Activities":107},
  areas:{"JVC":73019,"Meydan":50268,"Arjan":43188,"Dubai Creek":38248,"Al Furjan":24776,"Business Bay":13393}
};
SALES.forEach(s=>S.pipe[s.st]=(S.pipe[s.st]||0)+1);
QUOT.forEach(q=>S.qst[q.st]=(S.qst[q.st]||0)+1);
FIN.forEach(f=>{S.verts[f.v||"Other"]=(S.verts[f.v||"Other"]||0)+f.rev;S.topCl[f.cl]=(S.topCl[f.cl]||0)+f.rev;});

// ===== THEME CONTEXT =====
const ThemeCtx=createContext();
const light={bg:"#F8FAFC",s1:"#FFFFFF",s2:"#F1F5F9",s3:"#E2E8F0",border:"#E2E8F0",text:"#1E293B",tm:"#64748B",td:"#94A3B8",tw:"#0F172A",blue:"#3B82F6",blueG:"rgba(59,130,246,.08)",green:"#059669",greenG:"rgba(5,150,105,.08)",amber:"#D97706",amberG:"rgba(217,119,6,.08)",red:"#DC2626",redG:"rgba(220,38,38,.08)",purple:"#7C3AED",purpleG:"rgba(124,58,237,.08)",teal:"#0D9488",tealG:"rgba(13,148,136,.08)",pink:"#DB2777"};
const dark={bg:"#060A13",s1:"#0C1220",s2:"#111827",s3:"#1A2332",border:"#1E293B",text:"#E2E8F0",tm:"#94A3B8",td:"#64748B",tw:"#FFFFFF",blue:"#3B82F6",blueG:"rgba(59,130,246,.12)",green:"#10B981",greenG:"rgba(16,185,129,.12)",amber:"#F59E0B",amberG:"rgba(245,158,11,.12)",red:"#EF4444",redG:"rgba(239,68,68,.12)",purple:"#A78BFA",purpleG:"rgba(167,139,250,.12)",teal:"#14B8A6",tealG:"rgba(20,184,166,.12)",pink:"#EC4899"};

const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(Math.round(n));

// ===== STAGES =====
const STAGES=[{k:"Prospect",c:"#94A3B8"},{k:"Funnel",c:"#60A5FA"},{k:"Upside",c:"#A78BFA"},{k:"Commit",c:"#F59E0B"},{k:"Awarded",c:"#10B981"},{k:"Lost",c:"#EF4444"},{k:"Dropped",c:"#6B7280"}];
const stgC=s=>(STAGES.find(x=>x.k===s)||{c:"#94A3B8"}).c;

// ===== COMPONENTS =====
function Pill({children,color}){const t=useContext(ThemeCtx);return <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:(color||t.blue)+"1F",color:color||t.blue}}>{children}</span>}
function KPI({label,value,sub,pos=true}){const t=useContext(ThemeCtx);return <div style={{background:t.s1,borderRadius:14,padding:"16px 18px",border:"1px solid "+t.border,flex:1,minWidth:155}}><div style={{fontSize:11,color:t.td,textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:600}}>{label}</div><div style={{fontSize:22,fontWeight:700,color:t.tw}}>{value}</div>{sub&&<div style={{marginTop:5,fontSize:12,color:pos?t.green:t.amber}}>{sub}</div>}</div>}
function Card({children,style={}}){const t=useContext(ThemeCtx);return <div style={{background:t.s1,borderRadius:14,border:"1px solid "+t.border,overflow:"hidden",...style}}>{children}</div>}
function CH({title,right}){const t=useContext(ThemeCtx);return <div style={{padding:"14px 18px",borderBottom:"1px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div style={{fontSize:14,fontWeight:600,color:t.tw}}>{title}</div>{right}</div>}
function Btn({active,label,onClick}){const t=useContext(ThemeCtx);return <button onClick={onClick} style={{padding:"4px 12px",borderRadius:6,border:"none",background:active?t.blue:"transparent",color:active?"#fff":t.tm,fontSize:12,fontWeight:500,cursor:"pointer"}}>{label}</button>}

// ===== DASHBOARD =====
function DashPage(){
  const t=useContext(ThemeCtx);
  const pD=STAGES.map(s=>({...s,count:S.pipe[s.k]||0}));
  const tot=pD.reduce((a,d)=>a+d.count,0);
  const topCl=Object.entries(S.topCl).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const mx=topCl[0]?.[1]||1;
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="Total revenue" value={fmt(S.rev)+" AED"} sub={"Collected: "+fmt(S.paid)} pos/>
      <KPI label="Outstanding" value={fmt(S.due)+" AED"} sub="Due payments" pos={false}/>
      <KPI label="Pipeline" value={tot+" deals"} sub={(S.pipe.Awarded||0)+" awarded"} pos/>
      <KPI label="Influencers" value={S.inf} sub="UAE database" pos/>
      <KPI label="B2B contacts" value={fmt(S.contacts)} sub="Master database" pos/>
    </div>
    <Card><div style={{padding:18}}>
      <div style={{fontSize:14,fontWeight:600,color:t.tw,marginBottom:12}}>Sales pipeline ({tot} deals)</div>
      <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:28,marginBottom:12}}>
        {pD.filter(d=>d.count>0).map(d=><div key={d.k} style={{width:(d.count/tot*100)+"%",background:d.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",minWidth:20}}>{d.count}</div>)}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px"}}>{pD.map(d=><div key={d.k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.tm}}><div style={{width:8,height:8,borderRadius:2,background:d.c}}/>{d.k} ({d.count})</div>)}</div>
    </div></Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title="Top clients by revenue"/><div style={{padding:"6px 18px"}}>{topCl.map(([cl,v],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid "+t.border}}>
        <div style={{flex:1,fontSize:13,fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl}</div>
        <div style={{flex:2,height:6,background:t.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.green,borderRadius:3,width:(v/mx*100)+"%"}}/></div>
        <div style={{minWidth:50,textAlign:"right",fontSize:12,fontWeight:600,color:t.tw}}>{fmt(v)}</div>
      </div>)}</div></Card>
      <Card><CH title={"Quotations ("+QUOT.length+")"}/><div style={{padding:"6px 18px"}}>{Object.entries(S.qst).sort((a,b)=>b[1]-a[1]).map(([st,c],i)=>{
        const col=st==="Awarded"?t.green:st==="Dropped"?t.td:st==="Lost"?t.red:t.amber;
        return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+t.border}}>
          <Pill color={col}>{st}</Pill><div style={{flex:1}}/><div style={{fontSize:20,fontWeight:700,color:t.tw}}>{c}</div>
          <div style={{fontSize:12,color:t.td}}>{(c/QUOT.length*100).toFixed(0)}%</div>
        </div>;
      })}</div></Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title={"B2B contacts by industry"}/><div style={{padding:"6px 18px"}}>{Object.entries(S.cats).map(([cat,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+t.border}}><div style={{fontSize:12,color:t.text}}>{cat}</div><div style={{fontSize:13,fontWeight:600,color:t.blue}}>{c}</div></div>)}</div></Card>
      <Card><CH title={"Property owners ("+fmt(S.prop)+")"}/><div style={{padding:"6px 18px"}}>{Object.entries(S.areas).sort((a,b)=>b[1]-a[1]).map(([area,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+t.border}}><div style={{fontSize:12,color:t.text}}>{area}</div><div style={{fontSize:13,fontWeight:600,color:t.teal}}>{fmt(c)}</div></div>)}</div></Card>
    </div>
  </div>;
}

// ===== SALES =====
function SalesPage(){
  const t=useContext(ThemeCtx);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const stages=["All",...STAGES.map(s=>s.k)];
  let list=SALES;
  if(filter!=="All")list=list.filter(s=>s.st===filter);
  if(search)list=list.filter(s=>(s.cl+s.sp+s.v).toLowerCase().includes(search.toLowerCase()));
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="Total deals" value={SALES.length} sub={(S.pipe.Awarded||0)+" awarded"} pos/>
      <KPI label="Active" value={(S.pipe.Prospect||0)+(S.pipe.Funnel||0)+(S.pipe.Upside||0)} sub="In pipeline" pos/>
      <KPI label="Win rate" value={((S.pipe.Awarded||0)/SALES.length*100).toFixed(0)+"%"} pos/>
      <KPI label="Lost+Dropped" value={(S.pipe.Lost||0)+(S.pipe.Dropped||0)} pos={false}/>
    </div>
    <Card>
      <CH title={`Leads (${list.length})`} right={<div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:t.bg,border:"1px solid "+t.border,borderRadius:6,padding:"5px 10px",color:t.text,fontSize:12,width:130,outline:"none",marginRight:6}}/>
        {stages.map(s=><Btn key={s} active={filter===s} label={s} onClick={()=>setFilter(s)}/>)}
      </div>}/>
      <div style={{maxHeight:460,overflow:"auto"}}>
        {list.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.border,gap:12,fontSize:13,cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:32,height:32,borderRadius:8,background:stgC(s.st)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:stgC(s.st),fontWeight:700,fontSize:13,flexShrink:0}}>{s.cl[0]}</div>
          <div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.cl}</div><div style={{fontSize:11,color:t.td}}>{s.sp}{s.v?" · "+s.v:""}</div></div>
          <div style={{width:80}}><Pill color={stgC(s.st)}>{s.st}</Pill></div>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ===== INFLUENCERS =====
function InfPage(){
  const t=useContext(ThemeCtx);
  const [tier,setTier]=useState("All");
  const [search,setSearch]=useState("");
  const tiers=["All","Mega","Macro","Mid"];
  let list=INF;
  if(tier!=="All")list=list.filter(i=>i.tier===tier);
  if(search)list=list.filter(i=>(i.n+i.c+i.h).toLowerCase().includes(search.toLowerCase()));
  const tierC={Mega:t.purple,Macro:t.blue,Mid:t.teal,Micro:t.green};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="Total database" value={S.inf} sub="UAE verified" pos/>
      <KPI label="Showing" value={list.length} sub="Top by reach" pos/>
      <KPI label="Avg engagement" value={(INF.reduce((a,i)=>a+i.e,0)/INF.length).toFixed(1)+"%"} pos/>
    </div>
    <Card>
      <CH title={`Influencers (${list.length})`} right={<div style={{display:"flex",gap:3,alignItems:"center"}}>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:t.bg,border:"1px solid "+t.border,borderRadius:6,padding:"5px 10px",color:t.text,fontSize:12,width:160,outline:"none",marginRight:6}}/>
        {tiers.map(x=><Btn key={x} active={tier===x} label={x} onClick={()=>setTier(x)}/>)}
      </div>}/>
      <div style={{maxHeight:460,overflow:"auto"}}>
        {list.map((inf,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.border,gap:12,fontSize:13,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:36,height:36,borderRadius:"50%",background:(tierC[inf.tier]||t.td)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:tierC[inf.tier],fontWeight:700,fontSize:14,flexShrink:0}}>{inf.n[0]}</div>
          <div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inf.n}</div><div style={{fontSize:11,color:t.td}}>{inf.h} · {inf.c}</div></div>
          <div style={{width:60,textAlign:"right",fontSize:12,color:t.pink,fontWeight:600}}>{inf.ig}</div>
          <div style={{width:60,textAlign:"right",fontSize:12,color:t.teal,fontWeight:600}}>{inf.tt}</div>
          <div style={{width:60,textAlign:"right",fontSize:12,color:t.red,fontWeight:600}}>{inf.yt}</div>
          <div style={{width:70,textAlign:"right",fontWeight:700,color:t.tw}}>{inf.t}</div>
          <div style={{width:45,textAlign:"right",color:inf.e>=5?t.green:inf.e>=2?t.amber:t.td,fontWeight:600,fontSize:12}}>{inf.e}%</div>
          <div style={{width:55}}><Pill color={tierC[inf.tier]}>{inf.tier}</Pill></div>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ===== CASH FLOW =====
function CashPage(){
  const t=useContext(ThemeCtx);
  const [search,setSearch]=useState("");
  let list=FIN;if(search)list=list.filter(f=>f.cl.toLowerCase().includes(search.toLowerCase()));
  const topV=Object.entries(S.verts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const mxV=topV[0]?.[1]||1;
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="Total revenue" value={fmt(S.rev)+" AED"} sub={FIN.length+" invoices"} pos/>
      <KPI label="Collected" value={fmt(S.paid)+" AED"} sub={(S.paid/S.rev*100).toFixed(0)+"% rate"} pos/>
      <KPI label="Outstanding" value={fmt(S.due)+" AED"} pos={S.due===0}/>
      <KPI label="Avg deal" value={fmt(S.rev/FIN.length)+" AED"} pos/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title="Revenue by vertical"/><div style={{padding:"6px 18px"}}>{topV.map(([v,amt],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid "+t.border}}>
        <div style={{flex:1,fontSize:12,fontWeight:500,color:t.tw}}>{v}</div>
        <div style={{flex:2,height:6,background:t.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.teal,borderRadius:3,width:(amt/mxV*100)+"%"}}/></div>
        <div style={{minWidth:50,textAlign:"right",fontSize:12,fontWeight:600,color:t.tw}}>{fmt(amt)}</div>
      </div>)}</div></Card>
      <Card><CH title="Top clients"/><div style={{padding:"6px 18px"}}>{Object.entries(S.topCl).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([cl,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+t.border}}>
        <div style={{fontSize:12,fontWeight:500,color:t.tw}}>{cl}</div><div style={{fontSize:12,fontWeight:600,color:t.green}}>{fmt(v)}</div>
      </div>)}</div></Card>
    </div>
    <Card>
      <CH title={`Invoices (${list.length})`} right={<input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:t.bg,border:"1px solid "+t.border,borderRadius:6,padding:"5px 10px",color:t.text,fontSize:12,width:160,outline:"none"}}/>}/>
      <div style={{maxHeight:350,overflow:"auto"}}>
        {list.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.border,gap:12,fontSize:13}}>
          <div style={{flex:2,fontWeight:500,color:t.tw}}>{f.cl}</div>
          <div style={{flex:1,color:t.tm,fontSize:12}}>{f.v}</div>
          <div style={{width:70,textAlign:"right",color:t.green,fontWeight:600}}>{f.rev.toLocaleString()}</div>
          <div style={{width:70,textAlign:"right",color:t.text}}>{f.pd.toLocaleString()}</div>
          <div style={{width:60,textAlign:"right",color:f.du>0?t.red:t.td,fontWeight:f.du>0?600:400}}>{f.du>0?f.du.toLocaleString():"\u2014"}</div>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ===== QUOTATIONS =====
function QuotPage(){
  const t=useContext(ThemeCtx);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const sts=["All","Awarded","Dropped","Lost","Pending"];
  let list=QUOT;if(filter!=="All")list=list.filter(q=>q.st===filter);
  if(search)list=list.filter(q=>q.cl.toLowerCase().includes(search.toLowerCase()));
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="Total" value={QUOT.length} pos/>
      <KPI label="Awarded" value={S.qst.Awarded||0} sub={((S.qst.Awarded||0)/QUOT.length*100).toFixed(0)+"% win rate"} pos/>
      <KPI label="Dropped" value={S.qst.Dropped||0} pos={false}/>
      <KPI label="Pending" value={S.qst.Pending||0} sub="Active" pos/>
    </div>
    <Card>
      <CH title={`Quotations (${list.length})`} right={<div style={{display:"flex",gap:3,alignItems:"center"}}>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:t.bg,border:"1px solid "+t.border,borderRadius:6,padding:"5px 10px",color:t.text,fontSize:12,width:130,outline:"none",marginRight:6}}/>
        {sts.map(s=><Btn key={s} active={filter===s} label={s} onClick={()=>setFilter(s)}/>)}
      </div>}/>
      <div style={{maxHeight:460,overflow:"auto"}}>
        {list.map((q,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.border}}>
          <div style={{fontSize:13,fontWeight:500,color:t.tw}}>{q.cl}</div>
          <Pill color={q.st==="Awarded"?t.green:q.st==="Dropped"?t.td:q.st==="Lost"?t.red:t.amber}>{q.st}</Pill>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ===== CONTACTS =====
function ContactsPage(){
  const t=useContext(ThemeCtx);
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI label="B2B database" value={fmt(S.contacts)} sub="UAE & KSA" pos/>
      <KPI label="Sales leads" value={SALES.length} pos/>
      <KPI label="Influencers" value={S.inf} pos/>
      <KPI label="Property owners" value={fmt(S.prop)} sub="Dubai real estate" pos/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title="B2B by industry"/><div style={{padding:"6px 18px"}}>{Object.entries(S.cats).map(([c,n],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+t.border}}><div style={{fontSize:12,color:t.text}}>{c}</div><div style={{fontSize:13,fontWeight:600,color:t.blue}}>{n}</div></div>)}</div></Card>
      <Card><CH title="Property by area"/><div style={{padding:"6px 18px"}}>{Object.entries(S.areas).sort((a,b)=>b[1]-a[1]).map(([a,n],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+t.border}}><div style={{fontSize:12,color:t.text}}>{a}</div><div style={{fontSize:13,fontWeight:600,color:t.teal}}>{n.toLocaleString()}</div></div>)}</div></Card>
    </div>
  </div>;
}

// ===== NAV =====
const NAV=[{k:"dash",l:"Dashboard",i:"\u25A3"},{k:"sales",l:"Sales",i:"\u26A1"},{k:"inf",l:"Influencers",i:"\u2605"},{k:"cash",l:"Cash flow",i:"\u0024"},{k:"quot",l:"Quotations",i:"\u2611"},{k:"contacts",l:"Contacts",i:"\u263A"}];

// ===== MAIN APP =====
export default function App(){
  const [mode,setMode]=useState("dark");
  const [active,setActive]=useState("dash");
  const [aiOpen,setAiOpen]=useState(false);
  const [aiInput,setAiInput]=useState("");
  const [aiChat,setAiChat]=useState([{r:"ai",t:"Good morning Bader. System loaded: "+SALES.length+" leads, "+INF.length+" influencers, "+FIN.length+" invoices ("+fmt(S.rev)+" AED), "+QUOT.length+" quotations, "+fmt(S.contacts)+" B2B contacts, "+fmt(S.prop)+" property owners. What do you need?"}]);
  const chatRef=useRef(null);
  const t=mode==="dark"?dark:light;

  const sendAi=()=>{
    if(!aiInput.trim())return;
    setAiChat(p=>[...p,{r:"user",t:aiInput}]);
    const q=aiInput.toLowerCase();setAiInput("");
    setTimeout(()=>{
      let r="Let me check...";
      if(q.includes("revenue")||q.includes("cash")||q.includes("money"))r=`Total revenue: ${S.rev.toLocaleString()} AED across ${FIN.length} invoices. Collected: ${S.paid.toLocaleString()} AED (${(S.paid/S.rev*100).toFixed(0)}%). Outstanding: ${S.due.toLocaleString()} AED. Top client: Nine71 (78,250 AED).`;
      else if(q.includes("pipeline")||q.includes("sales")||q.includes("lead"))r=`Pipeline: ${SALES.length} deals. Awarded: ${S.pipe.Awarded||0}. Funnel: ${S.pipe.Funnel||0}. Prospect: ${S.pipe.Prospect||0}. Win rate: ${((S.pipe.Awarded||0)/SALES.length*100).toFixed(0)}%.`;
      else if(q.includes("influencer"))r=`${S.inf} UAE influencers. Top: ${INF[0]?.n} (${INF[0]?.t}), ${INF[1]?.n} (${INF[1]?.t}). Avg engagement: ${(INF.reduce((a,i)=>a+i.e,0)/INF.length).toFixed(1)}%.`;
      else if(q.includes("quote")||q.includes("quotation"))r=`${QUOT.length} quotations. Awarded: ${S.qst.Awarded||0} (${((S.qst.Awarded||0)/QUOT.length*100).toFixed(0)}%). Dropped: ${S.qst.Dropped||0}. Pending: ${S.qst.Pending||0}.`;
      else if(q.includes("contact")||q.includes("database"))r=`B2B: ${S.contacts} contacts. Top: F&B (880), Restaurant (611), Fashion (588). Property: ${fmt(S.prop)} owners across 6 Dubai areas.`;
      else if(q.includes("nestle"))r=`Nestle is your biggest strategic client. ${SALES.filter(s=>s.cl.toLowerCase().includes("nestle")).length} deals in pipeline, ${FIN.filter(f=>f.cl.toLowerCase().includes("nestle")).length} invoices.`;
      else r=`System has ${SALES.length} leads, ${FIN.length} invoices (${fmt(S.rev)} AED), ${QUOT.length} quotations, ${S.inf} influencers, ${fmt(S.contacts)} contacts, ${fmt(S.prop)} property owners. Ask me anything specific!`;
      setAiChat(p=>[...p,{r:"ai",t:r}]);
    },500);
  };
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[aiChat]);

  const pages={dash:<DashPage/>,sales:<SalesPage/>,inf:<InfPage/>,cash:<CashPage/>,quot:<QuotPage/>,contacts:<ContactsPage/>};

  return <ThemeCtx.Provider value={t}>
    <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:t.text,overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* SIDEBAR */}
      <div style={{width:175,background:t.s1,borderRight:"1px solid "+t.border,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"14px 12px",borderBottom:"1px solid "+t.border,display:"flex",alignItems:"center",gap:8}}>
          <img src={LOGO} alt="ALBAB" style={{height:26,borderRadius:4,filter:mode==="light"?"invert(1)":"none"}}/>
        </div>
        <div style={{flex:1,padding:"4px 0"}}>
          {NAV.map(n=><div key={n.k} onClick={()=>setActive(n.k)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 14px",cursor:"pointer",color:active===n.k?t.blue:t.tm,background:active===n.k?t.blueG:"transparent",borderRight:active===n.k?"2px solid "+t.blue:"2px solid transparent",fontSize:13,fontWeight:active===n.k?600:400,transition:"all .15s"}} onMouseEnter={e=>{if(active!==n.k)e.currentTarget.style.background=t.s3}} onMouseLeave={e=>{if(active!==n.k)e.currentTarget.style.background="transparent"}}><span style={{fontSize:15,width:18,textAlign:"center"}}>{n.i}</span>{n.l}</div>)}
        </div>
        <div style={{padding:"8px 10px",borderTop:"1px solid "+t.border,display:"flex",flexDirection:"column",gap:6}}>
          <div onClick={()=>setAiOpen(!aiOpen)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:t.purpleG,borderRadius:8,cursor:"pointer",color:t.purple,fontSize:12,fontWeight:600}}>
            <span>AI co-pilot</span><div style={{marginLeft:"auto",width:7,height:7,borderRadius:"50%",background:t.green,animation:"pulse 2s infinite"}}/>
          </div>
          {/* THEME TOGGLE */}
          <div onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:t.s2,borderRadius:8,cursor:"pointer",color:t.tm,fontSize:12}}>
            {mode==="dark"?"\u2600\uFE0F Light":"\u263E Dark"} mode
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{padding:"10px 20px",borderBottom:"1px solid "+t.border,background:t.s1,flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:t.tw}}>{NAV.find(n=>n.k===active)?.l}</div>
          <div style={{fontSize:11,color:t.td}}>ALBAB Media · Real data</div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:16}}>{pages[active]}</div>
      </div>

      {/* AI PANEL */}
      {aiOpen&&<div style={{width:300,background:t.s1,borderLeft:"1px solid "+t.border,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:t.green,animation:"pulse 2s infinite"}}/>
            <span style={{fontWeight:600,fontSize:13,color:t.tw}}>AI co-pilot</span>
            <Pill color={t.green}>LIVE</Pill>
          </div>
          <div onClick={()=>setAiOpen(false)} style={{cursor:"pointer",color:t.td,fontSize:18,lineHeight:1}}>{"\u00D7"}</div>
        </div>
        <div ref={chatRef} style={{flex:1,overflow:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
          {aiChat.map((m,i)=><div key={i} style={{alignSelf:m.r==="user"?"flex-end":"flex-start",maxWidth:"88%",padding:"9px 12px",borderRadius:m.r==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.r==="user"?t.blue:t.s2,color:m.r==="user"?"#fff":t.text,fontSize:12,lineHeight:1.5,border:m.r==="ai"?"1px solid "+t.border:"none"}}>{m.t}</div>)}
        </div>
        <div style={{padding:"8px 12px",borderTop:"1px solid "+t.border,display:"flex",gap:6}}>
          <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendAi()}} placeholder="Ask anything..." style={{flex:1,background:t.s2,border:"1px solid "+t.border,borderRadius:8,padding:"8px 10px",color:t.text,fontSize:12,outline:"none"}}/>
          <button onClick={sendAi} style={{background:t.blue,border:"none",borderRadius:8,padding:"0 12px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>Send</button>
        </div>
      </div>}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}input::placeholder{color:${t.td}}`}</style>
    </div>
  </ThemeCtx.Provider>;
}
