/*
 * Оригиналы файлов, найденные в медиатеке worldacademyms.com.
 * Основные документы уже нормализованы в CONTENT.documents; этот список
 * сохраняет исходные имена и форматы, чтобы ни один исходный файл не был
 * потерян при переносе.
 */
(function(){
  var files = [
    ["2023/6_-19.05.20.pdf","6_-19.05.20.pdf"],
    ["2023/7-272021.pdf","7-272021.pdf"],
    ["2023/PervyiEvrCongressSbornikdokladov2021.pdf","PervyiEvrCongressSbornikdokladov2021.pdf"],
    ["2023/Polozh_chlen_vznosEAGN.pdf","Polozh_chlen_vznosEAGN.pdf"],
    ["2023/Polozh_chlenctve_EAGN.pdf","Polozh_chlenctve_EAGN.pdf"],
    ["2023/Polozh_konkurs_EKIP.pdf","Polozh_konkurs_EKIP.pdf"],
    ["2023/UstavEGK.pdf","UstavEGK.pdf"],
    ["2023/otchet_2018.pdf","otchet_2018.pdf"],
    ["2023/otchet_2019.pdf","otchet_2019.pdf"],
    ["2023/protocol1-1.pdf","protocol1-1.pdf"],
    ["2023/protocol2.pdf","protocol2.pdf"],
    ["2023/protocol5.pdf","protocol5.pdf"],
    ["2023/uchreditelnyi-dogovor.pdf","uchreditelnyi-dogovor.pdf"],
    ["2023/ustav-eagn-1.pdf","ustav-eagn-1.pdf"],
    ["2024/AGREEMENT-.docx","AGREEMENT-.docx"],
    ["2024/AGREEMENT-1.pdf","AGREEMENT-1.pdf"],
    ["2024/Agenda_ПовестДня_12_04_2024.pdf","Agenda_ПовестДня_12_04_2024.pdf"],
    ["2024/CHARTER-1.pdf","CHARTER-1.pdf"],
    ["2024/CHARTER.pdf","CHARTER.pdf"],
    ["2024/CertificateАНГЛ.pdf","CertificateАНГЛ.pdf"],
    ["2024/History-of-Foundation-WAMS.pdf","History-of-Foundation-WAMS.pdf"],
    ["2024/MTM-1.pdf","MTM-1.pdf"],
    ["2024/MTM-11.pdf","MTM-11.pdf"],
    ["2024/MTM-2.pdf","MTM-2.pdf"],
    ["2024/PROTOCOL-8.docx","PROTOCOL-8.docx"],
    ["2024/PROTOCOL-8.pdf","PROTOCOL-8.pdf"],
    ["2024/PROTOCOL_2_WAMS.pdf","PROTOCOL_2_WAMS.pdf"],
    ["2024/PROTOKOL1_WAMS-1.pdf","PROTOKOL1_WAMS-1.pdf"],
    ["2024/PROTOKOL1_WAMS.docx","PROTOKOL1_WAMS.docx"],
    ["2024/PROTOKOL1_WAMS.pdf","PROTOKOL1_WAMS.pdf"],
    ["2024/Protocol_3_WAMS.pdf","Protocol_3_WAMS.pdf"],
    ["2024/REGULATIONS.pdf","REGULATIONS.pdf"],
    ["2024/АнықтамаКАЗ-1.pdf","АнықтамаКАЗ-1.pdf"],
    ["2024/АнықтамаКАЗ.pdf","АнықтамаКАЗ.pdf"],
    ["2024/ГрузинскАГН.pdf","ГрузинскАГН.pdf"],
    ["2024/ДеньГорняка_ПоздравлВАГН.pdf","ДеньГорняка_ПоздравлВАГН.pdf"],
    ["2024/Для-сайта-С-Днем-шахтера-1.pdf","Для-сайта-С-Днем-шахтера-1.pdf"],
    ["2024/Договор_КорпорЧленаВАГН-3.pdf","Договор_КорпорЧленаВАГН-3.pdf"],
    ["2024/Договор_КорпорЧленаВАГН.doc","Договор_КорпорЧленаВАГН.doc"],
    ["2024/ИсторияСозданияВАГН.pdf","ИсторияСозданияВАГН.pdf"],
    ["2024/КазахстанНАГН.pdf","КазахстанНАГН.pdf"],
    ["2024/КыргызстанАГН.pdf","КыргызстанАГН.pdf"],
    ["2024/МонголияАГН.pdf","МонголияАГН.pdf"],
    ["2024/Письмо-от-МонгАГН.pdf","Письмо-от-МонгАГН.pdf"],
    ["2024/ПоздравлениКыргызскойАГН.pdf","ПоздравлениКыргызскойАГН.pdf"],
    ["2024/Поздравление_ВАГН_АГНРФ.pdf","Поздравление_ВАГН_АГНРФ.pdf"],
    ["2024/ПоздравлениеМаралбаеваАО.pdf","ПоздравлениеМаралбаеваАО.pdf"],
    ["2024/Положение_КорпорЧленство_ВАГН.pdf","Положение_КорпорЧленство_ВАГН.pdf"],
    ["2024/Протокол-№3-от-12.04.2024г.pdf","Протокол-№3-от-12.04.2024г.pdf"],
    ["2024/Протокол1_ВАГН280423-1.pdf","Протокол1_ВАГН280423-1.pdf"],
    ["2024/Протокол1_ВАГН280423-2.pdf","Протокол1_ВАГН280423-2.pdf"],
    ["2024/Протокол1_ВАГН280423.pdf","Протокол1_ВАГН280423.pdf"],
    ["2024/Протокол2_ВАГН-1.pdf","Протокол2_ВАГН-1.pdf"],
    ["2024/Протокол2_ВАГН.pdf","Протокол2_ВАГН.pdf"],
    ["2024/Протокол8-ЕАГН_210922-1.pdf","Протокол8-ЕАГН_210922-1.pdf"],
    ["2024/Протокол8-ЕАГН_210922.pdf","Протокол8-ЕАГН_210922.pdf"],
    ["2024/РоссияАГН-1.pdf","РоссияАГН-1.pdf"],
    ["2024/РоссияАГН.pdf","РоссияАГН.pdf"],
    ["2024/СправкаРУС-1.pdf","СправкаРУС-1.pdf"],
    ["2024/СправкаРУС.pdf","СправкаРУС.pdf"]
  ];
  window.CONTENT_EXTRA_DOCS = files.map(function(item){
    return {
      cat_ru:"Архив оригиналов ВАГН",
      cat_en:"WAMS source archive",
      title_ru:item[1],
      title_en:item[1],
      href:"assets/archive/"+item[0],
      archive:true
    };
  });
})();
