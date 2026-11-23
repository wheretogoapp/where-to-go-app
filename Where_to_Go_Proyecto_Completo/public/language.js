/* Where to Go | Prefer device/browser locale; allow a visitor override.
   No machine translation API, no credentials, no cookies. Proper names stay original.
   Supported UI locales: es, en, fr, pt, de, it. Others safely fall back to es. */
(function(){
'use strict';
const codes=['es','en','fr','pt','de','it'];
const labels={
  "Mi perfil": ["My profile","Mon profil","Meu perfil","Mein Profil","Il mio profilo"],
  "Mi cuenta y preferencias ⚙️": ["My account and preferences ⚙️","Mon compte et mes préférences ⚙️","Minha conta e preferências ⚙️","Mein Konto und Einstellungen ⚙️","Il mio account e preferenze ⚙️"],
  "Visitados": ["Visited","Visités","Visitados","Besucht","Visitati"],
  "Explorados": ["Explored","Explorés","Explorados","Erkundet","Esplorati"],
  "Viajes": ["Trips","Voyages","Viagens","Reisen","Viaggi"],
  "Mis viajes": ["My trips","Mes voyages","Minhas viagens","Meine Reisen","I miei viaggi"],
  "Ajustes": ["Settings","Réglages","Ajustes","Einstellungen","Impostazioni"],
  "Tu actividad": ["Your activity","Votre activité","Sua atividade","Deine Aktivitäten","La tua attività"],
  "Tu mundo, a tu manera 🌎": ["Your world, your way 🌎","Votre monde, à votre façon 🌎","Seu mundo, do seu jeito 🌎","Deine Welt, auf deine Art 🌎","Il tuo mondo, a modo tuo 🌎"],
  "Ver mis favoritos": ["View my favorites","Voir mes favoris","Ver meus favoritos","Meine Favoriten ansehen","Vedi i miei preferiti"],
  "Instalar Where to Go": ["Install Where to Go","Installer Where to Go","Instalar o Where to Go","Where to Go installieren","Installa Where to Go"],
  "Iniciar sesión o cambiar cuenta": ["Sign in or switch account","Se connecter ou changer de compte","Entrar ou trocar de conta","Anmelden oder Konto wechseln","Accedi o cambia account"],
  "Cerrar sesión": ["Sign out","Se déconnecter","Sair","Abmelden","Esci"],
  "Mis lugares visitados 📍": ["My visited places 📍","Mes lieux visités 📍","Meus lugares visitados 📍","Meine besuchten Orte 📍","I miei luoghi visitati 📍"],
  "Historial de lugares explorados": ["Explored places history","Historique des lieux explorés","Histórico de lugares explorados","Verlauf erkundeter Orte","Cronologia dei luoghi esplorati"],
  "Organiza tus viajes 🧳": ["Organize your trips 🧳","Organisez vos voyages 🧳","Organize suas viagens 🧳","Organisiere deine Reisen 🧳","Organizza i tuoi viaggi 🧳"],
  "Nombre de tu viaje": ["Trip name","Nom du voyage","Nome da viagem","Reisename","Nome del viaggio"],
  "Fecha (opcional)": ["Date (optional)","Date (facultatif)","Data (opcional)","Datum (optional)","Data (facoltativa)"],
  "Crear viaje": ["Create trip","Créer un voyage","Criar viagem","Reise erstellen","Crea viaggio"],
  "Viajes guardados": ["Saved trips","Voyages enregistrés","Viagens salvas","Gespeicherte Reisen","Viaggi salvati"],
  "Nombre visible": ["Display name","Nom affiché","Nome de exibição","Anzeigename","Nome visualizzato"],
  "Ciudad habitual": ["Home city","Ville habituelle","Cidade habitual","Heimatstadt","Città abituale"],
  "Apariencia": ["Appearance","Apparence","Aparência","Darstellung","Aspetto"],
  "Automático (dispositivo)": ["Automatic (device)","Automatique (appareil)","Automático (dispositivo)","Automatisch (Gerät)","Automatico (dispositivo)"],
  "Oscuro": ["Dark","Sombre","Escuro","Dunkel","Scuro"],
  "Claro": ["Light","Clair","Claro","Hell","Chiaro"],
  "Idioma de la aplicación": ["App language","Langue de l’application","Idioma do aplicativo","App-Sprache","Lingua dell’app"],
  "Guardar los lugares que exploro (opcional)": ["Save places I explore (optional)","Enregistrer les lieux explorés (facultatif)","Salvar lugares que exploro (opcional)","Erkundete Orte speichern (optional)","Salva i luoghi esplorati (facoltativo)"],
  "Guardar cambios": ["Save changes","Enregistrer les modifications","Salvar alterações","Änderungen speichern","Salva modifiche"],
  "Descargar mis datos": ["Download my data","Télécharger mes données","Baixar meus dados","Meine Daten herunterladen","Scarica i miei dati"],
  "Borrar lugares explorados y visitados": ["Clear explored and visited places","Effacer les lieux explorés et visités","Apagar lugares explorados e visitados","Erkundete und besuchte Orte löschen","Elimina luoghi esplorati e visitati"],
  "Privacidad, ayuda y seguridad": ["Privacy, help and security","Confidentialité, aide et sécurité","Privacidade, ajuda e segurança","Datenschutz, Hilfe und Sicherheit","Privacy, aiuto e sicurezza"],
  "Política de privacidad": ["Privacy policy","Politique de confidentialité","Política de privacidade","Datenschutzerklärung","Informativa sulla privacy"],
  "Términos y condiciones": ["Terms and conditions","Conditions générales","Termos e condições","Nutzungsbedingungen","Termini e condizioni"],
  "Cambiar cuenta": ["Switch account","Changer de compte","Trocar conta","Konto wechseln","Cambia account"],
  "Eliminar viaje": ["Delete trip","Supprimer le voyage","Excluir viagem","Reise löschen","Elimina viaggio"],
  "Añadir lugar pendiente": ["Add selected place","Ajouter le lieu sélectionné","Adicionar local selecionado","Ausgewählten Ort hinzufügen","Aggiungi luogo selezionato"],
  "Ver un lugar no confirma que lo hayas visitado. Puedes marcarlo como visitado desde su ficha. El historial de lugares explorados solo se guarda si lo activas en Ajustes.": ["Opening a place does not mean you visited it. Mark it as visited from its listing. Explored history is only saved if you enable it in Settings.","Ouvrir un lieu ne signifie pas l’avoir visité. Marquez-le depuis sa fiche. L’historique est enregistré uniquement si vous l’activez dans les réglages.","Abrir um lugar não significa que você o visitou. Marque-o na ficha. O histórico só é salvo se ativado em Ajustes.","Das Öffnen eines Ortes bedeutet keinen Besuch. Markiere ihn in der Detailansicht. Der Verlauf wird nur mit deiner Zustimmung gespeichert.","Aprire un luogo non significa averlo visitato. Segnalo dalla scheda. La cronologia si salva solo se la attivi nelle Impostazioni."],
  "Cerrar perfil": ["Close profile","Fermer le profil","Fechar perfil","Profil schließen","Chiudi profilo"],
  "Mis viajes y lugares guardados": ["My trips and saved places","Mes voyages et lieux enregistrés","Minhas viagens e lugares salvos","Meine Reisen und gespeicherten Orte","I miei viaggi e luoghi salvati"],
  "Tu colección personal": ["Your personal collection","Votre collection personnelle","Sua coleção pessoal","Deine persönliche Sammlung","La tua raccolta personale"],
  "MI ESPACIO": ["MY SPACE","MON ESPACE","MEU ESPAÇO","MEIN BEREICH","IL MIO SPAZIO"],
  "Lugar guardado": ["Saved place","Lieu enregistré","Lugar salvo","Gespeicherter Ort","Luogo salvato"],
  "Lugares guardados": ["Saved places","Lieux enregistrés","Lugares salvos","Gespeicherte Orte","Luoghi salvati"],
  "Lugar guardado de Google Maps": ["Saved Google Maps place","Lieu Google Maps enregistré","Lugar salvo do Google Maps","Gespeicherter Google-Maps-Ort","Luogo Google Maps salvato"],
  "Marcar como visitado": ["Mark as visited","Marquer comme visité","Marcar como visitado","Als besucht markieren","Segna come visitato"],
  "Guardar en un viaje": ["Save to a trip","Ajouter à un voyage","Salvar em uma viagem","Einer Reise hinzufügen","Salva in un viaggio"],
  "Aquí se reúne todo lo que guardas para tus próximas aventuras: favoritos, lugares visitados y viajes.": ["Your favorites, visited places and trips come together here for your next adventures.","Retrouvez ici vos favoris, lieux visités et voyages pour vos prochaines aventures.","Aqui ficam seus favoritos, locais visitados e viagens para as próximas aventuras.","Hier findest du Favoriten, besuchte Orte und Reisen für deine nächsten Abenteuer.","Qui ritrovi preferiti, luoghi visitati e viaggi per le prossime avventure."],
  "Solo lugares que marcaste como visitados; no comprobamos tu ubicación física.": ["Only places you marked as visited; we do not verify your physical location.","Uniquement les lieux marqués comme visités ; nous ne vérifions pas votre présence.","Apenas locais marcados como visitados; não verificamos sua localização física.","Nur von dir als besucht markierte Orte; wir überprüfen deinen Standort nicht.","Solo luoghi contrassegnati come visitati; non verifichiamo la tua posizione."],
  "Se guarda al abrir fichas solo si activas la opción correspondiente.": ["Saved when you open listings only if you enable this option.","Enregistré lors de l’ouverture des fiches uniquement si vous l’activez.","Salvo ao abrir fichas apenas se você ativar esta opção.","Wird beim Öffnen nur gespeichert, wenn du diese Option aktivierst.","Salvato all’apertura delle schede solo se attivi questa opzione."],
  "Crea un viaje y agrégale lugares desde las fichas que encuentres en la aplicación.": ["Create a trip and add places from listings in the app.","Créez un voyage et ajoutez des lieux depuis leurs fiches.","Crie uma viagem e adicione lugares das fichas do aplicativo.","Erstelle eine Reise und füge Orte aus den Einträgen hinzu.","Crea un viaggio e aggiungi luoghi dalle schede nell’app."],

  'Inicio':['Home','Accueil','Início','Startseite','Home'],
  'Explorar':['Explore','Explorer','Explorar','Entdecken','Esplora'],
  'Explorar lugares':['Explore places','Explorer les lieux','Explorar lugares','Orte entdecken','Esplora luoghi'],
  'Mapa':['Map','Carte','Mapa','Karte','Mappa'],
  'Mapa interactivo':['Interactive map','Carte interactive','Mapa interativo','Interaktive Karte','Mappa interattiva'],
  'Favoritos':['Favorites','Favoris','Favoritos','Favoriten','Preferiti'],
  'Mis favoritos':['My favorites','Mes favoris','Meus favoritos','Meine Favoriten','I miei preferiti'],
  'Taxis y transporte':['Taxis and transport','Taxis et transports','Táxis e transporte','Taxis und Verkehr','Taxi e trasporti'],
  'Promocionar negocio':['Promote your business','Promouvoir une entreprise','Promover um negócio','Unternehmen bewerben','Promuovi la tua attività'],
  'Mis negocios':['My businesses','Mes entreprises','Meus negócios','Meine Unternehmen','Le mie attività'],
  'EXPLORAR':['EXPLORE','EXPLORER','EXPLORAR','ENTDECKEN','ESPLORA'],
  'PARA NEGOCIOS':['FOR BUSINESSES','POUR LES ENTREPRISES','PARA EMPRESAS','FÜR UNTERNEHMEN','PER LE AZIENDE'],
  'TU GUÍA PARA EXPLORAR':['YOUR EXPLORATION GUIDE','VOTRE GUIDE DE DÉCOUVERTE','O SEU GUIA DE EXPLORAÇÃO','DEIN REISEFÜHRER','LA TUA GUIDA ALLA SCOPERTA'],
  'Descubre el mundo':['Discover the world','Découvrez le monde','Descubra o mundo','Entdecke die Welt','Scopri il mondo'],
  'Descubre':['Discover','Découvrez','Descubra','Entdecke','Scopri'],
  'Descubre lugares':['Discover places','Découvrez des lieux','Descubra lugares','Entdecke Orte','Scopri luoghi'],
  'cerca de ti.':['near you.','près de vous.','perto de você.','in deiner Nähe.','vicino a te.'],
  'tu próxima aventura.':['your next adventure.','votre prochaine aventure.','sua próxima aventura.','dein nächstes Abenteuer.','la tua prossima avventura.'],
  'Explora los lugares más interesantes de':['Discover the best of','Découvrez le meilleur de','Descubra o melhor de','Entdecke die Highlights von','Scopri il meglio di'],
  'TU GUÍA EXCLUSIVA DE DESTINOS':['YOUR DESTINATION GUIDE','VOTRE GUIDE DE DESTINATIONS','O SEU GUIA DE DESTINOS','DEIN REISEFÜHRER','LA TUA GUIDA ALLE DESTINAZIONI'],
  'ENCUENTRA TU PLAN IDEAL':['FIND YOUR NEXT EXPERIENCE','TROUVEZ VOTRE PROCHAINE SORTIE','ENCONTRE SEU PRÓXIMO PASSEIO','FINDE DEIN NÄCHSTES ERLEBNIS','TROVA LA TUA PROSSIMA ESPERIENZA'],
  '¿Qué te gustaría hacer?':['What would you like to do?','Que souhaitez-vous faire ?','O que gostaria de fazer?','Was möchtest du unternehmen?','Cosa vorresti fare?'],
  'Todas las categorías':['All categories','Toutes les catégories','Todas as categorias','Alle Kategorien','Tutte le categorie'],
  'SELECCIÓN CERCA DE TI':['PICKS NEAR YOU','SÉLECTION PRÈS DE VOUS','SELEÇÃO PERTO DE VOCÊ','TIPPS IN DEINER NÄHE','SCELTI VICINO A TE'],
  'Destinos cerca de tu ubicación':['Places near your location','Lieux près de votre position','Lugares perto de você','Orte in deiner Nähe','Luoghi vicino a te'],
  'Ver más lugares':['See more places','Voir plus de lieux','Ver mais lugares','Mehr Orte ansehen','Vedi altri luoghi'],
  'TU PRÓXIMO DESCUBRIMIENTO':['YOUR NEXT DISCOVERY','VOTRE PROCHAINE DÉCOUVERTE','SUA PRÓXIMA DESCOBERTA','DEINE NÄCHSTE ENTDECKUNG','LA TUA PROSSIMA SCOPERTA'],
  'Resultados':['Results','Résultats','Resultados','Ergebnisse','Risultati'],
  'Ver en mapa':['View on map','Voir sur la carte','Ver no mapa','Auf Karte ansehen','Vedi sulla mappa'],
  'Todo':['All','Tout','Tudo','Alle','Tutto'],
  'Explorar cada provincia':['Explore every province','Découvrez chaque province','Explore cada província','Alle Provinzen entdecken','Esplora ogni provincia'],
  'Elige una provincia para ver su portada real. Selecciona un municipio para cambiar la búsqueda de lugares.':['Choose a province to see its landmark photo. Select a municipality to search there.','Choisissez une province pour voir sa photo. Sélectionnez une commune pour rechercher des lieux.','Escolha uma província para ver sua foto. Selecione um município para explorar.','Wähle eine Provinz für das Titelbild und eine Gemeinde für die Suche.','Scegli una provincia per vedere la foto e un comune per cercare luoghi.'],
  'Elegir municipio':['Choose a municipality','Choisir une commune','Escolher município','Gemeinde auswählen','Scegli comune'],
  'Ubicación actual activada':['Current location enabled','Position actuelle activée','Localização atual ativada','Aktueller Standort aktiviert','Posizione attuale attivata'],
  'Usar mi ubicación':['Use my location','Utiliser ma position','Usar minha localização','Standort verwenden','Usa la mia posizione'],
  'Usar mi ubicación actual':['Use my current location','Utiliser ma position actuelle','Usar minha localização atual','Meinen aktuellen Standort nutzen','Usa la mia posizione attuale'],
  'Cambiar zona':['Change area','Changer de zone','Mudar região','Region ändern','Cambia zona'],
  'Cambiar ubicación':['Change location','Changer de position','Mudar localização','Standort ändern','Cambia posizione'],
  '¿Dónde quieres explorar?':['Where would you like to explore?','Où souhaitez-vous explorer ?','Onde quer explorar?','Wo möchtest du suchen?','Dove vuoi esplorare?'],
  'Usa tu ubicación actual o descubre cualquier destino.':['Use your current location or discover another destination.','Utilisez votre position ou découvrez une autre destination.','Use sua localização atual ou descubra outro destino.','Nutze deinen Standort oder entdecke ein neues Reiseziel.','Usa la tua posizione o scopri un’altra destinazione.'],
  'O EXPLORA REPÚBLICA DOMINICANA':['OR EXPLORE THE DOMINICAN REPUBLIC','OU EXPLOREZ LA RÉPUBLIQUE DOMINICAINE','OU EXPLORE A REPÚBLICA DOMINICANA','ODER ENTDECKE DIE DOMINIKANISCHE REPUBLIK','OPPURE ESPLORA LA REPUBBLICA DOMINICANA'],
  'Provincia o Distrito Nacional':['Province or National District','Province ou District national','Província ou Distrito Nacional','Provinz oder Nationaldistrikt','Provincia o Distretto Nazionale'],
  'Municipio':['Municipality','Commune','Município','Gemeinde','Comune'],
  'Explorar este municipio':['Explore this municipality','Explorer cette commune','Explorar este município','Diese Gemeinde erkunden','Esplora questo comune'],
  'ACCESOS RÁPIDOS':['QUICK ACCESS','ACCÈS RAPIDE','ACESSO RÁPIDO','SCHNELLZUGRIFF','ACCESSO RAPIDO'],
  'Selecciona provincia':['Select province','Choisir une province','Selecione a província','Provinz wählen','Seleziona provincia'],
  'Selecciona una provincia':['Select a province','Sélectionnez une province','Selecione uma província','Provinz auswählen','Seleziona una provincia'],
  'Selecciona municipio':['Choose municipality','Choisir une commune','Escolha um município','Gemeinde wählen','Seleziona comune'],
  'Primero elige una provincia':['Choose a province first','Choisissez d’abord une province','Primeiro escolha uma província','Zuerst Provinz wählen','Scegli prima una provincia'],
  'A 2 km':['Within 2 km','Dans un rayon de 2 km','Até 2 km','Im Umkreis von 2 km','Entro 2 km'],
  'A 5 km':['Within 5 km','Dans un rayon de 5 km','Até 5 km','Im Umkreis von 5 km','Entro 5 km'],
  'A 12 km':['Within 12 km','Dans un rayon de 12 km','Até 12 km','Im Umkreis von 12 km','Entro 12 km'],
  'A 20 km':['Within 20 km','Dans un rayon de 20 km','Até 20 km','Im Umkreis von 20 km','Entro 20 km'],
  'A 30 km':['Within 30 km','Dans un rayon de 30 km','Até 30 km','Im Umkreis von 30 km','Entro 30 km'],
  'Ver detalles':['View details','Voir les détails','Ver detalhes','Details ansehen','Vedi dettagli'],
  'Guardar lugar':['Save place','Enregistrer ce lieu','Salvar lugar','Ort speichern','Salva luogo'],
  'Quitar favorito':['Remove favorite','Retirer des favoris','Remover favorito','Favorit entfernen','Rimuovi preferito'],
  'Agregar a favoritos':['Add to favorites','Ajouter aux favoris','Adicionar aos favoritos','Zu Favoriten hinzufügen','Aggiungi ai preferiti'],
  'Cómo llegar':['Directions','Itinéraire','Como chegar','Route','Indicazioni'],
  'Llamar':['Call','Appeler','Ligar','Anrufen','Chiama'],
  'Sitio web':['Website','Site web','Site','Website','Sito web'],
  'Foto real no disponible':['Real photo unavailable','Photo réelle indisponible','Foto real indisponível','Echtes Foto nicht verfügbar','Foto reale non disponibile'],
  'Ilustración temática · fotografía real pendiente':['Illustration · real photo pending','Illustration · photo réelle à venir','Ilustração · foto real pendente','Illustration · echtes Foto ausstehend','Illustrazione · foto reale in arrivo'],
  'Dirección no publicada':['Address not listed','Adresse non renseignée','Endereço indisponível','Adresse nicht angegeben','Indirizzo non disponibile'],
  'No encontramos lugares con esos filtros':['No places match these filters','Aucun lieu avec ces filtres','Nenhum lugar encontrado com esses filtros','Keine Orte mit diesen Filtern','Nessun luogo trovato con questi filtri'],
  'Ampliar búsqueda':['Expand search','Élargir la recherche','Ampliar busca','Suche erweitern','Amplia ricerca'],
  'Cambiar ubicación':['Change location','Changer de position','Mudar localização','Standort wechseln','Cambia posizione'],
  'Explorar la zona en OpenStreetMap':['Explore the area on OpenStreetMap','Explorer la zone sur OpenStreetMap','Explorar a área no OpenStreetMap','Gegend auf OpenStreetMap entdecken','Esplora la zona su OpenStreetMap'],
  '¿Conoces un lugar cercano que falta? Avísanos':['Know a nearby place we missed? Tell us','Vous connaissez un lieu manquant ? Signalez-le','Conhece um lugar próximo que falta? Avise-nos','Kennst du einen fehlenden Ort? Sag uns Bescheid','Conosci un luogo mancante? Segnalacelo'],
  'No encontramos lugares con este filtro':['No places match this filter','Aucun lieu trouvé pour ce filtre','Nenhum lugar com este filtro','Keine Orte für diesen Filter','Nessun luogo per questo filtro'],
  '¿Tienes un negocio?':['Own a business?','Vous avez une entreprise ?','Tem um negócio?','Hast du ein Unternehmen?','Hai un’attività?'],
  'Quiero anunciarme':['I want to advertise','Je veux faire de la publicité','Quero anunciar','Ich möchte werben','Voglio fare pubblicità'],
  'Tu negocio merece ser descubierto.':['Your business deserves to be discovered.','Votre entreprise mérite d’être découverte.','Seu negócio merece ser descoberto.','Dein Unternehmen verdient Aufmerksamkeit.','La tua attività merita di essere scoperta.'],
  'Promocionar negocio':['Promote business','Promouvoir une entreprise','Promover negócio','Unternehmen bewerben','Promuovi attività'],
  'Enviar solicitud de registro':['Submit registration request','Envoyer la demande','Enviar solicitação de cadastro','Anmeldung senden','Invia richiesta'],
  'Registrarse con correo':['Register with email','S’inscrire par e-mail','Cadastrar com e-mail','Mit E-Mail registrieren','Registrati con email'],
  'Continuar con Google':['Continue with Google','Continuer avec Google','Continuar com Google','Weiter mit Google','Continua con Google'],
  'Continuar con Apple':['Continue with Apple','Continuer avec Apple','Continuar com Apple','Weiter mit Apple','Continua con Apple'],
  'Continuar con Facebook':['Continue with Facebook','Continuer avec Facebook','Continuar com Facebook','Weiter mit Facebook','Continua con Facebook'],
  'El mundo está esperando por ti.':['The world is waiting for you.','Le monde vous attend.','O mundo está esperando por você.','Die Welt wartet auf dich.','Il mondo ti aspetta.'],
  'DESCUBRE TU PRÓXIMA AVENTURA':['DISCOVER YOUR NEXT ADVENTURE','DÉCOUVREZ VOTRE PROCHAINE AVENTURE','DESCUBRA SUA PRÓXIMA AVENTURA','ENTDECKE DEIN NÄCHSTES ABENTEUER','SCOPRI LA TUA PROSSIMA AVVENTURA'],
  'Cerrar':['Close','Fermer','Fechar','Schließen','Chiudi'],
  'Salir':['Log out','Se déconnecter','Sair','Abmelden','Esci'],
  'Reintentar':['Retry','Réessayer','Tentar novamente','Erneut versuchen','Riprova'],
  '📷 ¿Tienes una foto real de este lugar?':['📷 Have a real photo of this place?','📷 Vous avez une vraie photo de ce lieu ?','📷 Tem uma foto real deste local?','📷 Hast du ein echtes Foto dieses Ortes?','📷 Hai una foto reale di questo luogo?']
};
Object.assign(labels,{
  'Explora cada provincia':['Explore every province','Découvrez chaque province','Explore cada província','Entdecke jede Provinz','Esplora ogni provincia'],
  'PUERTO PLATA · FOTO REAL':['PUERTO PLATA · REAL PHOTO','PUERTO PLATA · PHOTO RÉELLE','PUERTO PLATA · FOTO REAL','PUERTO PLATA · ECHTES FOTO','PUERTO PLATA · FOTO REALE'],
  'Clemente Transport VIP · Aeropuertos, hoteles y traslados privados.':['Clemente Transport VIP · Airports, hotels and private transfers.','Clemente Transport VIP · Aéroports, hôtels et transferts privés.','Clemente Transport VIP · Aeroportos, hotéis e traslados privados.','Clemente Transport VIP · Flughäfen, Hotels und private Transfers.','Clemente Transport VIP · Aeroporti, hotel e trasferimenti privati.'],
  'Idioma / Language':['Language','Langue','Idioma','Sprache','Lingua'],
  'Tu próxima aventura empieza aquí':['Your next adventure starts here','Votre prochaine aventure commence ici','Sua próxima aventura começa aqui','Dein nächstes Abenteuer beginnt hier','La tua prossima avventura inizia qui'],
  'El mundo está lleno de lugares increíbles. Encuentra el tuyo.':['A world of amazing places awaits. Find yours.','Le monde regorge de lieux incroyables. Trouvez le vôtre.','O mundo está cheio de lugares incríveis. Encontre o seu.','Die Welt ist voller besonderer Orte. Finde deinen.','Il mondo è pieno di luoghi incredibili. Trova il tuo.'],
  'De playas escondidas a experiencias inolvidables. Explora lugares reales, descubre negocios locales y planea tu próxima salida.':['From hidden beaches to unforgettable experiences. Discover real places and plan your next trip.','Des plages secrètes aux expériences inoubliables. Découvrez de vrais lieux et préparez votre sortie.','De praias escondidas a experiências inesquecíveis. Descubra lugares reais e planeje sua viagem.','Von versteckten Stränden bis zu unvergesslichen Erlebnissen. Entdecke echte Orte.','Da spiagge nascoste a esperienze indimenticabili. Scopri luoghi reali e organizza la tua gita.'],
  'La República Dominicana':['The Dominican Republic','La République dominicaine','A República Dominicana','Die Dominikanische Republik','La Repubblica Dominicana'],
  'se vive':['is best enjoyed by','se vit en','se vive','erlebst du beim','si vive'],
  'explorando.':['exploring.','explorant.','explorando.','Entdecken.','esplorando.'],
  '32 DEMARCACIONES · 158 MUNICIPIOS':['32 AREAS · 158 MUNICIPALITIES','32 ZONES · 158 COMMUNES','32 ÁREAS · 158 MUNICÍPIOS','32 GEBIETE · 158 GEMEINDEN','32 AREE · 158 COMUNI'],
  'Provincia':['Province','Province','Província','Provinz','Provincia'],
  'Vista previa de portada: los lugares cercanos siguen vinculados a tu ubicación hasta que elijas un municipio.':['Photo preview only. Nearby results stay tied to your location until you select a municipality.','Aperçu de photo uniquement. Les résultats restent liés à votre position jusqu’au choix d’une commune.','Prévia apenas. Os resultados próximos continuam ligados à sua localização até escolher um município.','Nur Fotovorschau. Nahe Orte bleiben an deinen Standort gebunden, bis du eine Gemeinde auswählst.','Solo anteprima. I luoghi vicini restano legati alla tua posizione finché non scegli un comune.'],
  'Activa tu ubicación para encontrar lugares realmente cercanos.':['Enable location to discover places really close to you.','Activez votre position pour trouver les lieux proches.','Ative sua localização para encontrar lugares próximos.','Aktiviere deinen Standort, um echte Orte in deiner Nähe zu finden.','Attiva la posizione per trovare luoghi davvero vicini.'],
  'TU PRÓXIMO DESCUBRIMIENTO':['YOUR NEXT DISCOVERY','VOTRE PROCHAINE DÉCOUVERTE','SUA PRÓXIMA DESCOBERTA','DEINE NÄCHSTE ENTDECKUNG','LA TUA PROSSIMA SCOPERTA'],
  'Encuentra experiencias increíbles cerca de ti o en cualquier ciudad.':['Find unforgettable experiences near you or in another city.','Découvrez des expériences inoubliables près de vous ou ailleurs.','Encontre experiências incríveis perto de você ou em outra cidade.','Finde spannende Erlebnisse in deiner Nähe oder in anderen Städten.','Trova esperienze incredibili vicino a te o in un’altra città.'],
  'Buscando lugares cercanos...':['Searching nearby places...','Recherche de lieux proches...','Buscando lugares próximos...','Suche nach Orten in der Nähe...','Ricerca di luoghi vicini...'],
  'Catálogo local de OpenStreetMap (si la importación de GitHub se completó). La cobertura local está en ampliación; no inventamos establecimientos. Sin fotografía comprobable no mostramos otra foto.':['Local OpenStreetMap directory. Coverage is still growing. No made-up places or unrelated photos.','Annuaire OpenStreetMap local. La couverture s’étend. Aucun lieu inventé ni photo sans rapport.','Diretório local OpenStreetMap. A cobertura está aumentando. Sem locais inventados nem fotos erradas.','Lokales OpenStreetMap-Verzeichnis. Die Abdeckung wächst. Keine erfundenen Orte oder falschen Fotos.','Catalogo locale OpenStreetMap. La copertura è in crescita. Nessun luogo inventato o foto sbagliata.'],
  'SERVICIO DESTACADO · PUERTO PLATA':['FEATURED SERVICE · PUERTO PLATA','SERVICE À LA UNE · PUERTO PLATA','SERVIÇO EM DESTAQUE · PUERTO PLATA','EMPFOHLENER SERVICE · PUERTO PLATA','SERVIZIO IN EVIDENZA · PUERTO PLATA'],
  'Tu próximo trayecto, en manos expertas.':['Your next ride, in expert hands.','Votre prochain trajet, entre de bonnes mains.','Sua próxima viagem, em boas mãos.','Deine nächste Fahrt in guten Händen.','Il tuo prossimo viaggio, in ottime mani.'],
  'Explorar transporte':['Explore transport','Découvrir les transports','Explorar transporte','Transport entdecken','Esplora trasporti'],
  'Negocios destacados de tu provincia':['Featured businesses in your province','Entreprises en vedette dans votre province','Negócios em destaque na sua província','Empfohlene Unternehmen deiner Provinz','Attività in evidenza nella tua provincia'],
  'PUBLICIDAD · ESPACIOS PREMIUM':['ADVERTISING · PREMIUM SPOTS','PUBLICITÉ · ESPACES PREMIUM','PUBLICIDADE · ESPAÇOS PREMIUM','WERBUNG · PREMIUM-PLÄTZE','PUBBLICITÀ · SPAZI PREMIUM'],
  'PARA EMPRENDEDORES':['FOR BUSINESS OWNERS','POUR LES ENTREPRENEURS','PARA EMPREENDEDORES','FÜR UNTERNEHMER','PER GLI IMPRENDITORI'],
  'Aparece frente a personas que están buscando exactamente lo que ofreces.':['Be discovered by people looking for exactly what you offer.','Soyez vu par des personnes qui cherchent ce que vous proposez.','Seja encontrado por pessoas que procuram exatamente o que você oferece.','Erreiche Menschen, die genau dein Angebot suchen.','Fatti trovare da chi cerca proprio ciò che offri.'],
  'A DÓNDE IR · REPÚBLICA DOMINICANA':['WHERE TO GO · DOMINICAN REPUBLIC','OÙ ALLER · RÉPUBLIQUE DOMINICAINE','AONDE IR · REPÚBLICA DOMINICANA','WOHIN GEHEN · DOMINIKANISCHE REPUBLIK','DOVE ANDARE · REPUBBLICA DOMINICANA'],
  'Entra para guardar tus lugares favoritos y descubrir nuevas experiencias cerca de donde estás.':['Sign in to save favorites and discover experiences near you.','Connectez-vous pour enregistrer vos favoris et découvrir des expériences près de vous.','Entre para salvar favoritos e descobrir experiências perto de você.','Melde dich an, um Favoriten zu speichern und Erlebnisse zu entdecken.','Accedi per salvare i preferiti e scoprire esperienze vicino a te.'],
  'O UTILIZA TU CORREO':['OR USE YOUR EMAIL','OU UTILISEZ VOTRE E-MAIL','OU USE SEU E-MAIL','ODER DEINE E-MAIL NUTZEN','OPPURE USA L’EMAIL'],
  'Correo electrónico':['Email address','Adresse e-mail','Endereço de e-mail','E-Mail-Adresse','Indirizzo email'],
  'Contraseña':['Password','Mot de passe','Senha','Passwort','Password'],
  'Entrar':['Sign in','Se connecter','Entrar','Anmelden','Accedi'],
  'Crear cuenta':['Create account','Créer un compte','Criar conta','Konto erstellen','Crea account'],
  'Explorar demostración sin cuenta':['Explore demo without an account','Explorer la démo sans compte','Explorar demonstração sem conta','Demo ohne Konto ansehen','Esplora demo senza account'],
  'Quiero guardar mi historial de lugares vistos para recibir recomendaciones personalizadas. Puedo desactivarlo.':['I agree to save viewed places for personalized recommendations. I can turn this off.','J’accepte d’enregistrer mes visites pour des recommandations personnalisées. Je peux désactiver cette option.','Aceito salvar lugares vistos para recomendações personalizadas. Posso desativar isso.','Ich stimme zu, angesehene Orte für Empfehlungen zu speichern. Ich kann dies deaktivieren.','Accetto di salvare i luoghi visti per consigli personalizzati. Posso disattivarlo.'],
  'El acceso real se activa al conectar Supabase y los proveedores.':['Real sign-in requires Supabase and configured providers.','La connexion réelle nécessite Supabase et les fournisseurs configurés.','O acesso real precisa do Supabase e provedores configurados.','Echte Anmeldung benötigt Supabase und konfigurierte Anbieter.','L’accesso reale richiede Supabase e provider configurati.'],
  'NUEVO':['NEW','NOUVEAU','NOVO','NEU','NOVITÀ'],
  'LOCAL':['LOCAL','LOCAL','LOCAL','LOKAL','LOCALE'],
  'Qué ver':['Things to see','À voir','O que ver','Sehenswertes','Da vedere'],
  'Buscar':['Search','Rechercher','Buscar','Suchen','Cerca'],
  'Explorar ahora':['Explore now','Explorer','Explorar agora','Jetzt entdecken','Esplora ora'],
  'Selecciona provincia o Distrito Nacional':['Select province or National District','Choisir une province ou le District national','Selecione a província ou Distrito Nacional','Provinz oder Nationaldistrikt wählen','Seleziona provincia o Distretto Nazionale'],
  'Reintentar carga de municipios':['Retry municipality loading','Réessayer le chargement des communes','Tentar carregar municípios novamente','Gemeinden erneut laden','Riprova caricamento comuni'],
  'Tu próxima aventura está por descubrirse':['Your next adventure is waiting to be discovered','Votre prochaine aventure vous attend','Sua próxima aventura está esperando','Dein nächstes Abenteuer wartet auf dich','La tua prossima avventura ti aspetta'],
  'Esto es una ciudad seleccionada, NO tu ubicación. Activa el GPS para ver solo lugares cerca de ti.':['This is a chosen city, NOT your GPS position. Enable GPS to find nearby places.','Il s’agit d’une ville choisie, PAS de votre position. Activez le GPS pour les lieux proches.','Esta é uma cidade escolhida, NÃO sua posição. Ative o GPS para ver locais próximos.','Das ist eine ausgewählte Stadt, NICHT dein GPS-Standort. GPS für Orte in deiner Nähe aktivieren.','È una città scelta, NON la tua posizione GPS. Attiva il GPS per i luoghi vicini.'],
  '¿Tienes una foto real de este lugar?':['Have a real photo of this place?','Vous avez une vraie photo de ce lieu ?','Tem uma foto real deste lugar?','Hast du ein echtes Foto dieses Ortes?','Hai una foto reale di questo luogo?'],
  'Cerca de mí':['Near me','Près de moi','Perto de mim','In meiner Nähe','Vicino a me'],
  'Cerca de ti':['Near you','Près de vous','Perto de você','In deiner Nähe','Vicino a te'],
  'Ir al inicio':['Go to home','Aller à l’accueil','Ir ao início','Zur Startseite','Vai alla home']
});

// Additional complete-screen translations: onboarding, search and geographic controls.
Object.assign(labels, {
  "Explora el mundo": [
    "Explore the world",
    "Explorez le monde",
    "Explore o mundo",
    "Entdecke die Welt",
    "Esplora il mondo"
  ],
  "Tu próxima aventura comienza aquí.": [
    "Your next adventure starts here.",
    "Votre prochaine aventure commence ici.",
    "Sua próxima aventura começa aqui.",
    "Dein nächstes Abenteuer beginnt hier.",
    "La tua prossima avventura inizia qui."
  ],
  "Descubre destinos increíbles, negocios y experiencias auténticas cerca de ti.": [
    "Discover amazing destinations, businesses and authentic experiences near you.",
    "Découvrez des destinations, des commerces et des expériences authentiques près de vous.",
    "Descubra destinos incríveis, negócios e experiências autênticas perto de você.",
    "Entdecke fantastische Reiseziele, Geschäfte und authentische Erlebnisse in deiner Nähe.",
    "Scopri destinazioni incredibili, attività ed esperienze autentiche vicino a te."
  ],
  "Comenzar a descubrir": [
    "Start exploring",
    "Commencer à explorer",
    "Começar a explorar",
    "Jetzt entdecken",
    "Inizia a esplorare"
  ],
  "Haz tu experiencia personal": [
    "Personalize your experience",
    "Personnalisez votre expérience",
    "Personalize sua experiência",
    "Personalisiere dein Erlebnis",
    "Personalizza la tua esperienza"
  ],
  "¿A dónde quieres ir?": [
    "Where would you like to go?",
    "Où souhaitez-vous aller ?",
    "Aonde você quer ir?",
    "Wohin möchtest du reisen?",
    "Dove vuoi andare?"
  ],
  "República Dominicana": [
    "Dominican Republic",
    "République dominicaine",
    "República Dominicana",
    "Dominikanische Republik",
    "Repubblica Dominicana"
  ],
  "Permite tu ubicación para descubrir lugares reales cerca de ti. También puedes elegir cualquier destino manualmente.": [
    "Allow location access to find real places nearby. You can also choose a destination manually.",
    "Autorisez la localisation pour découvrir de vrais lieux à proximité. Vous pouvez aussi choisir une destination.",
    "Permita o acesso à localização para encontrar lugares reais próximos. Também pode escolher um destino.",
    "Erlaube den Standortzugriff, um echte Orte in deiner Nähe zu finden. Du kannst auch ein Ziel auswählen.",
    "Consenti l'accesso alla posizione per trovare luoghi reali vicini. Puoi anche scegliere una destinazione."
  ],
  "Usar mi ubicación": [
    "Use my location",
    "Utiliser ma position",
    "Usar minha localização",
    "Meinen Standort verwenden",
    "Usa la mia posizione"
  ],
  "Elegir país o ciudad": [
    "Choose country or city",
    "Choisir un pays ou une ville",
    "Escolher país ou cidade",
    "Land oder Stadt wählen",
    "Scegli paese o città"
  ],
  "Continuar sin usar GPS": [
    "Continue without GPS",
    "Continuer sans GPS",
    "Continuar sem GPS",
    "Ohne GPS fortfahren",
    "Continua senza GPS"
  ],
  "WHERE TO GO · DESCUBRE EL MUNDO": [
    "WHERE TO GO · DISCOVER THE WORLD",
    "WHERE TO GO · DÉCOUVREZ LE MONDE",
    "WHERE TO GO · DESCUBRA O MUNDO",
    "WHERE TO GO · ENTDECKE DIE WELT",
    "WHERE TO GO · SCOPRI IL MONDO"
  ],
  "Cada lugar tiene una historia.": [
    "Every place has a story.",
    "Chaque lieu a une histoire.",
    "Cada lugar tem uma história.",
    "Jeder Ort hat eine Geschichte.",
    "Ogni luogo ha una storia."
  ],
  "Paisajes auténticos de República Dominicana": [
    "Authentic scenery of the Dominican Republic",
    "Paysages authentiques de République dominicaine",
    "Paisagens autênticas da República Dominicana",
    "Authentische Landschaften der Dominikanischen Republik",
    "Paesaggi autentici della Repubblica Dominicana"
  ],
  "TU PRÓXIMA AVENTURA COMIENZA AQUÍ": [
    "YOUR NEXT ADVENTURE STARTS HERE",
    "VOTRE PROCHAINE AVENTURE COMMENCE ICI",
    "SUA PRÓXIMA AVENTURA COMEÇA AQUI",
    "DEIN NÄCHSTES ABENTEUER BEGINNT HIER",
    "LA TUA PROSSIMA AVVENTURA INIZIA QUI"
  ],
  "Descubre lugares que te encantarán.": [
    "Discover places you'll love.",
    "Découvrez des lieux que vous allez adorer.",
    "Descubra lugares que você vai adorar.",
    "Entdecke Orte, die du lieben wirst.",
    "Scopri luoghi che amerai."
  ],
  "Inicia sesión para guardar favoritos y descubrir qué hacer cerca de ti.": [
    "Sign in to save favorites and discover things to do near you.",
    "Connectez-vous pour enregistrer vos favoris et découvrir quoi faire près de vous.",
    "Entre para salvar favoritos e descobrir o que fazer perto de você.",
    "Melde dich an, speichere Favoriten und entdecke Aktivitäten in deiner Nähe.",
    "Accedi per salvare i preferiti e scoprire cosa fare vicino a te."
  ],
  "Continuar con correo": [
    "Continue with email",
    "Continuer avec un e-mail",
    "Continuar com e-mail",
    "Mit E-Mail fortfahren",
    "Continua con email"
  ],
  "O CONTINÚA CON TU CORREO": [
    "OR CONTINUE WITH EMAIL",
    "OU CONTINUEZ AVEC VOTRE E-MAIL",
    "OU CONTINUE COM SEU E-MAIL",
    "ODER MIT E-MAIL FORTFAHREN",
    "OPPURE CONTINUA CON EMAIL"
  ],
  "Elige cómo entrar a tu cuenta de Where to Go.": [
    "Choose how to sign in to your Where to Go account.",
    "Choisissez comment accéder à votre compte Where to Go.",
    "Escolha como entrar na sua conta Where to Go.",
    "Wähle, wie du dich bei Where to Go anmeldest.",
    "Scegli come accedere al tuo account Where to Go."
  ],
  "Tours y excursiones": [
    "Tours and excursions",
    "Visites et excursions",
    "Passeios e excursões",
    "Touren und Ausflüge",
    "Tour ed escursioni"
  ],
  "¿Tienes un negocio?": [
    "Own a business?",
    "Vous avez une entreprise ?",
    "Você tem um negócio?",
    "Hast du ein Unternehmen?",
    "Hai un'attività?"
  ],
  "Haz que más personas te descubran.": [
    "Help more people discover you.",
    "Faites-vous connaître auprès de plus de personnes.",
    "Faça mais pessoas conhecerem você.",
    "Lass mehr Menschen dich entdecken.",
    "Fatti scoprire da più persone."
  ],
  "Quiero anunciarme": [
    "Promote my business",
    "Promouvoir mon entreprise",
    "Anunciar meu negócio",
    "Mein Unternehmen bewerben",
    "Promuovi la mia attività"
  ],
  "Tu ubicación": [
    "Your location",
    "Votre position",
    "Sua localização",
    "Dein Standort",
    "La tua posizione"
  ],
  "Algunas búsquedas están temporalmente limitadas": [
    "Some searches are temporarily limited",
    "Certaines recherches sont temporairement limitées",
    "Algumas buscas estão temporariamente limitadas",
    "Einige Suchfunktionen sind vorübergehend eingeschränkt",
    "Alcune ricerche sono temporaneamente limitate"
  ],
  "Seguimos mostrando los lugares disponibles en tu zona.": [
    "We continue showing available places in your area.",
    "Nous continuons d'afficher les lieux disponibles dans votre région.",
    "Continuamos mostrando locais disponíveis na sua região.",
    "Wir zeigen weiterhin verfügbare Orte in deiner Nähe.",
    "Continuiamo a mostrare i luoghi disponibili nella tua zona."
  ],
  "Reintentar búsqueda": [
    "Retry search",
    "Réessayer la recherche",
    "Tentar busca novamente",
    "Suche erneut versuchen",
    "Riprova la ricerca"
  ],
  "Destino internacional": [
    "International destination",
    "Destination internationale",
    "Destino internacional",
    "Internationales Reiseziel",
    "Destinazione internazionale"
  ],
  "Estamos preparando las fichas, fotografías icónicas y negocios verificados de esta ciudad o país. Aún no hay un catálogo publicado para esta ubicación.": [
    "We are preparing listings, landmark photos and verified businesses for this destination. The directory is not yet available here.",
    "Nous préparons les fiches, photos emblématiques et commerces vérifiés pour cette destination. Le catalogue n'est pas encore disponible.",
    "Estamos preparando listagens, fotos icônicas e empresas verificadas para este destino. O catálogo ainda não está disponível.",
    "Wir bereiten Einträge, Sehenswürdigkeitenfotos und geprüfte Unternehmen für dieses Reiseziel vor. Das Verzeichnis ist noch nicht verfügbar.",
    "Stiamo preparando schede, foto dei luoghi e attività verificate per questa destinazione. Il catalogo non è ancora disponibile."
  ],
  "No utilizamos fotografías de otras ciudades ni mostramos negocios de República Dominicana como si estuvieran aquí.": [
    "We never show photos or businesses from other cities as if they were here.",
    "Nous ne présentons jamais des photos ou commerces d'autres villes comme s'ils étaient ici.",
    "Não mostramos fotos ou negócios de outras cidades como se fossem daqui.",
    "Wir zeigen niemals Fotos oder Unternehmen aus anderen Städten als lokale Ergebnisse.",
    "Non mostriamo foto o attività di altre città come se fossero locali."
  ],
  "Cambiar país o ciudad": [
    "Change country or city",
    "Changer de pays ou de ville",
    "Mudar país ou cidade",
    "Land oder Stadt ändern",
    "Cambia paese o città"
  ],
  "¿Qué hay cerca de ti": [
    "What's near you",
    "Que trouve-t-on près de vous",
    "O que há perto de você",
    "Was ist in deiner Nähe",
    "Cosa c'è vicino a te"
  ],
  "Restaurantes, playas, bares y planes para disfrutar.": [
    "Restaurants, beaches, bars and things to do.",
    "Restaurants, plages, bars et activités à découvrir.",
    "Restaurantes, praias, bares e passeios.",
    "Restaurants, Strände, Bars und Erlebnisse.",
    "Ristoranti, spiagge, bar e attività."
  ],
  "DESTINOS QUE INSPIRAN": [
    "INSPIRING DESTINATIONS",
    "DESTINATIONS INSPIRANTES",
    "DESTINOS INSPIRADORES",
    "INSPIRIERENDE REISEZIELE",
    "DESTINAZIONI CHE ISPIRANO"
  ],
  "Comenzar a explorar": [
    "Start exploring",
    "Commencer à explorer",
    "Começar a explorar",
    "Erkundung starten",
    "Inizia a esplorare"
  ],
  "EXPLORA TU ZONA": [
    "EXPLORE YOUR AREA",
    "EXPLOREZ VOTRE RÉGION",
    "EXPLORE SUA REGIÃO",
    "ENTDECKE DEINE UMGEBUNG",
    "ESPLORA LA TUA ZONA"
  ],
  "DESCUBRE TU DESTINO": [
    "DISCOVER YOUR DESTINATION",
    "DÉCOUVREZ VOTRE DESTINATION",
    "DESCUBRA SEU DESTINO",
    "ENTDECKE DEIN REISEZIEL",
    "SCOPRI LA TUA DESTINAZIONE"
  ],
  "Explora lugares auténticos": [
    "Explore authentic places",
    "Explorez des lieux authentiques",
    "Explore lugares autênticos",
    "Entdecke authentische Orte",
    "Esplora luoghi autentici"
  ],
  "Fotografías y lugares de la zona seleccionada": [
    "Photos and places in your selected area",
    "Photos et lieux de la zone choisie",
    "Fotos e lugares da região selecionada",
    "Fotos und Orte in der gewählten Region",
    "Foto e luoghi della zona selezionata"
  ],
  "DESCUBRE MÁS CERCA": [
    "DISCOVER MORE NEARBY",
    "DÉCOUVREZ PLUS PRÈS DE VOUS",
    "DESCUBRA MAIS POR PERTO",
    "MEHR IN DEINER NÄHE",
    "SCOPRI ALTRO VICINO A TE"
  ],
  "Explora más zonas de tu destino": [
    "Explore more areas of your destination",
    "Explorez d'autres zones de votre destination",
    "Explore mais áreas do seu destino",
    "Entdecke weitere Gebiete deines Reiseziels",
    "Esplora altre zone della tua destinazione"
  ],
  "Elige una dirección para conocer otros lugares cercanos.": [
    "Choose a direction to discover more nearby places.",
    "Choisissez une direction pour découvrir d'autres lieux à proximité.",
    "Escolha uma direção para descobrir mais lugares próximos.",
    "Wähle eine Richtung, um weitere Orte in der Nähe zu finden.",
    "Scegli una direzione per scoprire altri luoghi vicini."
  ],
  "Las zonas son áreas aproximadas de búsqueda, no límites oficiales de barrios o sectores. Solo mostramos establecimientos geolocalizados.": [
    "These areas are approximate search zones, not official neighborhood boundaries. Only geolocated places appear.",
    "Ces zones de recherche sont approximatives et ne représentent pas des limites officielles. Seuls les lieux géolocalisés sont affichés.",
    "Essas áreas de busca são aproximadas, não limites oficiais. Exibimos apenas estabelecimentos geolocalizados.",
    "Diese Suchgebiete sind ungefähre Bereiche und keine offiziellen Stadtteilgrenzen. Es erscheinen nur geolokalisierte Orte.",
    "Le zone di ricerca sono approssimative, non confini ufficiali. Mostriamo solo luoghi geolocalizzati."
  ],
  "Buscar destinos y establecimientos": [
    "Search destinations and businesses",
    "Rechercher des destinations et des commerces",
    "Buscar destinos e estabelecimentos",
    "Reiseziele und Unternehmen suchen",
    "Cerca destinazioni e attività"
  ],
  "INSPIRACIÓN PARA TU PRÓXIMO VIAJE": [
    "INSPIRATION FOR YOUR NEXT TRIP",
    "INSPIRATION POUR VOTRE PROCHAIN VOYAGE",
    "INSPIRAÇÃO PARA SUA PRÓXIMA VIAGEM",
    "INSPIRATION FÜR DEINE NÄCHSTE REISE",
    "ISPIRAZIONE PER IL PROSSIMO VIAGGIO"
  ],
  "Un mundo por descubrir": [
    "A world to explore",
    "Un monde à découvrir",
    "Um mundo para explorar",
    "Eine Welt voller Entdeckungen",
    "Un mondo da scoprire"
  ],
  "Elige una provincia para conocer la fotografía, su autor y su licencia.": [
    "Choose a province to see its photo, photographer and license.",
    "Choisissez une province pour voir la photo, son auteur et sa licence.",
    "Escolha uma província para ver a foto, o autor e a licença.",
    "Wähle eine Provinz, um Foto, Urheber und Lizenz zu sehen.",
    "Scegli una provincia per vedere la foto, l'autore e la licenza."
  ]
});

// Main destinations, tours, transport, maps and account labels.
Object.assign(labels, {
  "Elige una provincia para explorar lugares reales alrededor de su ciudad de referencia. Si deseas otra zona, selecciona un municipio.": [
    "Choose a province to explore real places near its main city. Select a municipality to explore another area.",
    "Choisissez une province pour découvrir des lieux près de sa ville de référence. Choisissez une commune pour explorer ailleurs.",
    "Escolha uma província para explorar lugares próximos da cidade de referência. Selecione um município para outra área.",
    "Wähle eine Provinz, um Orte nahe der Referenzstadt zu entdecken. Für andere Gebiete eine Gemeinde wählen.",
    "Scegli una provincia per trovare luoghi vicino alla città di riferimento. Per altre zone scegli un comune."
  ],
  "Al elegir una provincia se mostrarán lugares alrededor de una ciudad de referencia. No equivale a toda la provincia.": [
    "Choosing a province shows places near a reference city, not the entire province.",
    "La sélection d'une province affiche des lieux près d'une ville de référence, pas de toute la province.",
    "Selecionar uma província mostra lugares próximos da cidade de referência, não de toda a província.",
    "Bei der Auswahl einer Provinz werden Orte um eine Referenzstadt angezeigt, nicht die ganze Provinz.",
    "Selezionando una provincia vedrai luoghi vicino a una città di riferimento, non dell'intera provincia."
  ],
  "Detectando tu ubicación": [
    "Detecting your location",
    "Localisation en cours",
    "Detectando sua localização",
    "Standort wird ermittelt",
    "Rilevamento della posizione"
  ],
  "Permite la ubicación para descubrir restaurantes, bares, playas y servicios cercanos.": [
    "Allow location access to discover nearby restaurants, bars, beaches and services.",
    "Autorisez votre position pour trouver restaurants, bars, plages et services proches.",
    "Permita a localização para descobrir restaurantes, bares, praias e serviços próximos.",
    "Erlaube den Standortzugriff, um Restaurants, Bars, Strände und Dienste in der Nähe zu finden.",
    "Consenti l'accesso alla posizione per trovare ristoranti, bar, spiagge e servizi vicini."
  ],
  "TU PRÓXIMA EXPERIENCIA": [
    "YOUR NEXT EXPERIENCE",
    "VOTRE PROCHAINE EXPÉRIENCE",
    "SUA PRÓXIMA EXPERIÊNCIA",
    "DEIN NÄCHSTES ERLEBNIS",
    "LA TUA PROSSIMA ESPERIENZA"
  ],
  "¿Qué te gustaría descubrir?": [
    "What would you like to discover?",
    "Qu'aimeriez-vous découvrir ?",
    "O que você gostaria de descobrir?",
    "Was möchtest du entdecken?",
    "Cosa vorresti scoprire?"
  ],
  "Todas las categorías ↓": [
    "All categories ↓",
    "Toutes les catégories ↓",
    "Todas as categorias ↓",
    "Alle Kategorien ↓",
    "Tutte le categorie ↓"
  ],
  "Lugares con fotos cerca de ti": [
    "Places with photos near you",
    "Lieux avec photos près de vous",
    "Lugares com fotos perto de você",
    "Orte mit Fotos in deiner Nähe",
    "Luoghi con foto vicino a te"
  ],
  "Consultando lugares…": [
    "Looking up places…",
    "Recherche des lieux…",
    "Consultando lugares…",
    "Orte werden gesucht…",
    "Ricerca dei luoghi…"
  ],
  "Traslados privados y turísticos. Reserva por WhatsApp.": [
    "Private and tourist transfers. Book via WhatsApp.",
    "Transferts privés et touristiques. Réservez via WhatsApp.",
    "Traslados privados e turísticos. Reserve pelo WhatsApp.",
    "Private Fahrten und Touristentransfers. Buchung per WhatsApp.",
    "Trasferimenti privati e turistici. Prenota su WhatsApp."
  ],
  "Reservar": [
    "Book",
    "Réserver",
    "Reservar",
    "Buchen",
    "Prenota"
  ],
  "DESTINOS PARA DESCUBRIR": [
    "DESTINATIONS TO DISCOVER",
    "DESTINATIONS À DÉCOUVRIR",
    "DESTINOS PARA DESCOBRIR",
    "REISEZIELE ENTDECKEN",
    "DESTINAZIONI DA SCOPRIRE"
  ],
  "Lugares con fotos reales vinculadas a su ficha · Google Maps, fuentes abiertas y fotografías autorizadas · Las búsquedas de Google se consultan por zona.": [
    "Real place-specific photos from Google Maps, open sources and authorized photographs. Google searches are limited to your area.",
    "Photos authentiques des lieux provenant de Google Maps, de sources ouvertes et de contenus autorisés. Les recherches Google sont locales.",
    "Fotos reais vinculadas aos lugares, do Google Maps, fontes abertas e imagens autorizadas. As buscas Google são por região.",
    "Echte ortsbezogene Fotos aus Google Maps, offenen Quellen und freigegebenen Bildern. Google-Suchen sind regional begrenzt.",
    "Foto reali associate ai luoghi, da Google Maps, fonti aperte e immagini autorizzate. Le ricerche Google sono locali."
  ],
  "Establecimientos reales por ubicación. Las fichas sin imagen se muestran sin inventar fotos.": [
    "Real places by location. Listings without photos never use invented images.",
    "Lieux réels par emplacement. Les fiches sans photo n'utilisent jamais d'images inventées.",
    "Estabelecimentos reais por localização. Fichas sem foto não usam imagens inventadas.",
    "Echte Orte nach Standort. Einträge ohne Fotos zeigen keine erfundenen Bilder.",
    "Luoghi reali per posizione. Le schede senza foto non usano immagini inventate."
  ],
  "WHERE TO GO · EXPERIENCIAS": [
    "WHERE TO GO · EXPERIENCES",
    "WHERE TO GO · EXPÉRIENCES",
    "WHERE TO GO · EXPERIÊNCIAS",
    "WHERE TO GO · ERLEBNISSE",
    "WHERE TO GO · ESPERIENZE"
  ],
  "Las mejores aventuras empiezan aquí.": [
    "The best adventures start here.",
    "Les meilleures aventures commencent ici.",
    "As melhores aventuras começam aqui.",
    "Die besten Abenteuer beginnen hier.",
    "Le migliori avventure iniziano qui."
  ],
  "Promociona tu gira, tour o excursión aquí": [
    "Promote your tour or excursion here",
    "Faites connaître votre visite ou excursion ici",
    "Divulgue seu passeio ou excursão aqui",
    "Bewirb hier deine Tour oder deinen Ausflug",
    "Promuovi qui il tuo tour o la tua escursione"
  ],
  "Este espacio está disponible para organizadores de experiencias y excursiones. Sé de los primeros en publicar tu actividad.": [
    "This space is for tour and experience organizers. Be among the first to list an activity.",
    "Cet espace accueille les organisateurs d'activités et d'excursions. Soyez parmi les premiers à publier.",
    "Este espaço é para organizadores de passeios e experiências. Seja um dos primeiros a publicar.",
    "Dieser Bereich ist für Tour- und Erlebnisveranstalter. Veröffentliche als einer der Ersten dein Angebot.",
    "Questo spazio è per gli organizzatori di esperienze ed escursioni. Pubblica la tua attività tra i primi."
  ],
  "por mes · por anuncio": [
    "per month · per listing",
    "par mois · par annonce",
    "por mês · por anúncio",
    "pro Monat · pro Anzeige",
    "al mese · per annuncio"
  ],
  "Publicar mi tour o excursión": [
    "List my tour or excursion",
    "Publier ma visite ou excursion",
    "Publicar meu passeio ou excursão",
    "Tour oder Ausflug veröffentlichen",
    "Pubblica il mio tour o la mia escursione"
  ],
  "La publicación requiere revisión y confirmación del pago. No se cobra automáticamente en esta versión.": [
    "Listings require review and payment confirmation. No automatic charges are made in this version.",
    "Les annonces nécessitent une vérification et une confirmation du paiement. Aucun prélèvement automatique dans cette version.",
    "A publicação exige revisão e confirmação do pagamento. Não há cobrança automática nesta versão.",
    "Einträge werden erst nach Prüfung und Zahlungsbestätigung veröffentlicht. In dieser Version erfolgt keine automatische Abbuchung.",
    "La pubblicazione richiede verifica e conferma del pagamento. Nessun addebito automatico in questa versione."
  ],
  "Muévete con": [
    "Travel with",
    "Voyagez en toute",
    "Viaje com",
    "Unterwegs mit",
    "Viaggia con"
  ],
  "confianza.": [
    "confidence.",
    "confiance.",
    "confiança.",
    "Vertrauen.",
    "fiducia."
  ],
  "Explora operadores de taxis y transporte por provincia y municipio. Reservaciones directas con cada empresa.": [
    "Explore taxi and transport operators by province and municipality. Book directly with each business.",
    "Découvrez les taxis et transporteurs par province et commune. Réservez directement auprès des entreprises.",
    "Explore operadores de táxi e transporte por província e município. Reserve diretamente com cada empresa.",
    "Finde Taxi- und Transportunternehmen nach Provinz und Gemeinde. Buche direkt beim Anbieter.",
    "Trova taxi e trasporti per provincia e comune. Prenota direttamente con ogni azienda."
  ],
  "DIRECTORIO DE TRANSPORTE": [
    "TRANSPORT DIRECTORY",
    "ANNUAIRE DES TRANSPORTS",
    "DIRETÓRIO DE TRANSPORTE",
    "TRANSPORTVERZEICHNIS",
    "ELENCO DEI TRASPORTI"
  ],
  "Encuentra transporte en tu zona": [
    "Find transport in your area",
    "Trouvez un transport près de vous",
    "Encontre transporte em sua região",
    "Finde Verkehrsdienste in deiner Nähe",
    "Trova trasporti nella tua zona"
  ],
  "Elegir provincia": [
    "Choose a province",
    "Choisir une province",
    "Escolher província",
    "Provinz wählen",
    "Scegli provincia"
  ],
  "Toda la provincia": [
    "Entire province",
    "Toute la province",
    "Toda a província",
    "Gesamte Provinz",
    "Tutta la provincia"
  ],
  "CONTACTO DIRECTO CON EL NEGOCIO": [
    "CONTACT THE BUSINESS DIRECTLY",
    "CONTACT DIRECT AVEC L'ENTREPRISE",
    "CONTATO DIRETO COM A EMPRESA",
    "UNTERNEHMEN DIREKT KONTAKTIEREN",
    "CONTATTA DIRETTAMENTE L'ATTIVITÀ"
  ],
  "Operadores de transporte": [
    "Transport operators",
    "Opérateurs de transport",
    "Operadores de transporte",
    "Transportunternehmen",
    "Operatori di trasporto"
  ],
  "Los operadores destacados incluidos manualmente aparecen con sus datos comerciales conocidos. No inventamos direcciones ni puntos de recogida. Los demás proveedores se agregarán después de verificar su registro.": [
    "Featured operators display the business information we have verified. We do not invent addresses or pickup points. Other providers will be listed after verification.",
    "Les transporteurs mis en avant affichent leurs informations vérifiées. Aucune adresse ni lieu de prise en charge n'est inventé. D'autres prestataires seront ajoutés après vérification.",
    "Operadores em destaque mostram dados comerciais verificados. Não inventamos endereços ou pontos de embarque. Outros serão adicionados após verificação.",
    "Vorgestellte Anbieter zeigen geprüfte Geschäftsdaten. Adressen und Abholorte werden nicht erfunden. Weitere Anbieter folgen nach Prüfung.",
    "Gli operatori in evidenza mostrano dati commerciali verificati. Non inventiamo indirizzi o punti di raccolta. Altri saranno aggiunti dopo la verifica."
  ],
  "¿Tu empresa presta servicios de transporte?": [
    "Does your business provide transport services?",
    "Votre entreprise propose-t-elle des transports ?",
    "Sua empresa presta serviços de transporte?",
    "Bietet dein Unternehmen Transportdienste an?",
    "La tua azienda offre servizi di trasporto?"
  ],
  "Prepara tu perfil para aparecer en el directorio de Where to Go.": [
    "Prepare your profile to appear in the Where to Go directory.",
    "Préparez votre profil pour figurer dans l'annuaire Where to Go.",
    "Prepare seu perfil para aparecer no diretório do Where to Go.",
    "Erstelle dein Profil für das Where to Go-Verzeichnis.",
    "Prepara il tuo profilo per comparire nell'elenco di Where to Go."
  ],
  "Registrar mi servicio": [
    "List my service",
    "Inscrire mon service",
    "Cadastrar meu serviço",
    "Meinen Dienst eintragen",
    "Registra il mio servizio"
  ],
  "VISUALIZA TU CIUDAD": [
    "EXPLORE YOUR CITY ON THE MAP",
    "EXPLOREZ VOTRE VILLE SUR LA CARTE",
    "EXPLORE SUA CIDADE NO MAPA",
    "DEINE STADT AUF DER KARTE",
    "ESPLORA LA TUA CITTÀ SULLA MAPPA"
  ],
  "Explora puntos de interés y abre las direcciones en tu mapa favorito.": [
    "Explore points of interest and get directions in your preferred map app.",
    "Découvrez les lieux d'intérêt et ouvrez l'itinéraire dans votre application de cartes préférée.",
    "Explore pontos de interesse e abra rotas no seu aplicativo de mapas.",
    "Entdecke interessante Orte und öffne die Route in deiner bevorzugten Karten-App.",
    "Esplora i punti d'interesse e apri le indicazioni nell'app di mappe che preferisci."
  ],
  "Centrar en mí": [
    "Center on me",
    "Me centrer",
    "Centralizar em mim",
    "Auf mich zentrieren",
    "Centra su di me"
  ],
  "Lugares cercanos": [
    "Nearby places",
    "Lieux à proximité",
    "Lugares próximos",
    "Orte in der Nähe",
    "Luoghi vicini"
  ],
  "TU COLECCIÓN PERSONAL": [
    "YOUR PERSONAL COLLECTION",
    "VOTRE COLLECTION PERSONNELLE",
    "SUA COLEÇÃO PESSOAL",
    "DEINE PERSÖNLICHE SAMMLUNG",
    "LA TUA COLLEZIONE PERSONALE"
  ],
  "Guarda los lugares que quieres visitar y vuelve a encontrarlos fácilmente.": [
    "Save places you want to visit and find them again easily.",
    "Enregistrez les lieux à visiter et retrouvez-les facilement.",
    "Salve lugares que deseja visitar e encontre-os facilmente depois.",
    "Speichere Orte, die du besuchen möchtest, und finde sie später wieder.",
    "Salva i luoghi che vuoi visitare e ritrovali facilmente."
  ],
  "TU ESPACIO COMO EMPRENDEDOR": [
    "YOUR BUSINESS SPACE",
    "VOTRE ESPACE ENTREPRENEUR",
    "SEU ESPAÇO DE EMPREENDEDOR",
    "DEIN UNTERNEHMENSBEREICH",
    "IL TUO SPAZIO IMPRENDITORIALE"
  ],
  "Gestiona los registros guardados en este dispositivo, antes de publicarlos.": [
    "Manage listings saved on this device before publication.",
    "Gérez les fiches enregistrées sur cet appareil avant publication.",
    "Gerencie os cadastros salvos neste dispositivo antes da publicação.",
    "Verwalte auf diesem Gerät gespeicherte Einträge vor der Veröffentlichung.",
    "Gestisci le registrazioni salvate su questo dispositivo prima di pubblicarle."
  ],
  "+ Registrar otro negocio": [
    "+ Add another business",
    "+ Ajouter une entreprise",
    "+ Cadastrar outro negócio",
    "+ Weiteres Unternehmen eintragen",
    "+ Registra un'altra attività"
  ],
  "Hecho para descubrir el mundo 🌎 ·": [
    "Made to discover the world 🌎 ·",
    "Créé pour découvrir le monde 🌎 ·",
    "Feito para descobrir o mundo 🌎 ·",
    "Gemacht, um die Welt zu entdecken 🌎 ·",
    "Creato per scoprire il mondo 🌎 ·"
  ],
  "Privacidad": [
    "Privacy",
    "Confidentialité",
    "Privacidade",
    "Datenschutz",
    "Privacy"
  ],
  "Términos": [
    "Terms",
    "Conditions",
    "Termos",
    "Nutzungsbedingungen",
    "Termini"
  ],
  "Negocios": [
    "Businesses",
    "Entreprises",
    "Negócios",
    "Unternehmen",
    "Attività"
  ],
  "País": [
    "Country",
    "Pays",
    "País",
    "Land",
    "Paese"
  ],
  "Ciudad": [
    "City",
    "Ville",
    "Cidade",
    "Stadt",
    "Città"
  ],
  "Provincia / estado / región": [
    "Province / state / region",
    "Province / État / région",
    "Província / estado / região",
    "Provinz / Bundesland / Region",
    "Provincia / stato / regione"
  ],
  "Todas las regiones": [
    "All regions",
    "Toutes les régions",
    "Todas as regiões",
    "Alle Regionen",
    "Tutte le regioni"
  ],
  "Selecciona una ciudad": [
    "Choose a city",
    "Choisissez une ville",
    "Escolha uma cidade",
    "Stadt auswählen",
    "Seleziona una città"
  ],
  "Selecciona un país para consultar sus ciudades disponibles.": [
    "Choose a country to see available cities.",
    "Choisissez un pays pour voir les villes disponibles.",
    "Escolha um país para ver as cidades disponíveis.",
    "Wähle ein Land, um verfügbare Städte zu sehen.",
    "Scegli un paese per vedere le città disponibili."
  ],
  "Tu ubicación se detecta automáticamente si das permiso. También puedes elegir otro país, región o ciudad desde aquí.": [
    "Your location is detected if you grant permission. You can also choose another country, region or city here.",
    "Votre position est détectée si vous donnez l'autorisation. Vous pouvez aussi choisir un autre pays, une région ou une ville.",
    "Sua localização é detectada se você permitir. Você também pode escolher outro país, região ou cidade.",
    "Mit deiner Erlaubnis wird dein Standort ermittelt. Du kannst hier auch ein anderes Land, eine Region oder Stadt wählen.",
    "La posizione viene rilevata con il tuo consenso. Puoi anche scegliere un altro paese, regione o città."
  ],
  "Continuar": [
    "Continue",
    "Continuer",
    "Continuar",
    "Weiter",
    "Continua"
  ],
  "Categoría": [
    "Category",
    "Catégorie",
    "Categoria",
    "Kategorie",
    "Categoria"
  ],
  "Tipo de aporte": [
    "Contribution type",
    "Type de contribution",
    "Tipo de contribuição",
    "Art des Beitrags",
    "Tipo di contributo"
  ],
  "Falta un lugar": [
    "Missing place",
    "Lieu manquant",
    "Lugar ausente",
    "Fehlender Ort",
    "Luogo mancante"
  ],
  "Fotografía real del lugar": [
    "Real photo of the place",
    "Photo authentique du lieu",
    "Foto real do lugar",
    "Echtes Foto des Ortes",
    "Foto reale del luogo"
  ],
  "No lo sé": [
    "I don't know",
    "Je ne sais pas",
    "Não sei",
    "Ich weiß es nicht",
    "Non lo so"
  ],
  "Radio de búsqueda": [
    "Search radius",
    "Rayon de recherche",
    "Raio de busca",
    "Suchradius",
    "Raggio di ricerca"
  ],
  "Actualizar lugares": [
    "Refresh places",
    "Actualiser les lieux",
    "Atualizar lugares",
    "Orte aktualisieren",
    "Aggiorna luoghi"
  ]
});

// Monetization and account copy in the six supported UI languages.
Object.assign(labels, {
  "WHERE TO GO BUSINESS": [
    "WHERE TO GO BUSINESS",
    "WHERE TO GO ENTREPRISES",
    "WHERE TO GO NEGÓCIOS",
    "WHERE TO GO BUSINESS",
    "WHERE TO GO BUSINESS"
  ],
  "Haz que el mundo": [
    "Let the world",
    "Faites en sorte que le monde",
    "Faça o mundo",
    "Lass die Welt",
    "Fai in modo che il mondo"
  ],
  "descubra": [
    "discover",
    "découvre",
    "descubra",
    "entdeckt",
    "scopra"
  ],
  "tu negocio.": [
    "your business.",
    "votre entreprise.",
    "seu negócio.",
    "dein Unternehmen.",
    "la tua attività."
  ],
  "Conecta con personas que están buscando un lugar como el tuyo. Lanza tu perfil con transparencia y una propuesta medible.": [
    "Connect with people looking for a business like yours. Publish a transparent, measurable listing.",
    "Échangez avec les personnes qui cherchent une entreprise comme la vôtre. Publiez un profil transparent et mesurable.",
    "Conecte-se com pessoas que procuram um negócio como o seu. Publique um perfil transparente e mensurável.",
    "Erreiche Menschen, die ein Unternehmen wie deines suchen. Veröffentliche ein transparentes, messbares Profil.",
    "Raggiungi persone che cercano un'attività come la tua. Pubblica un profilo trasparente e misurabile."
  ],
  "Registrar mi negocio": [
    "List my business",
    "Inscrire mon entreprise",
    "Cadastrar meu negócio",
    "Mein Unternehmen eintragen",
    "Registra la mia attività"
  ],
  "CRECE CON NOSOTROS": [
    "GROW WITH US",
    "GRANDISSEZ AVEC NOUS",
    "CRESÇA CONOSCO",
    "WACHSE MIT UNS",
    "CRESCI CON NOI"
  ],
  "Elige cómo destacar": [
    "Choose how to stand out",
    "Choisissez comment vous démarquer",
    "Escolha como se destacar",
    "Wähle, wie du dich hervorheben möchtest",
    "Scegli come distinguerti"
  ],
  "Registro Básico": [
    "Basic listing",
    "Inscription de base",
    "Cadastro básico",
    "Basiseintrag",
    "Registrazione base"
  ],
  "Para tener una ficha normal verificada dentro de tu categoría.": [
    "For a standard verified listing in your category.",
    "Pour une fiche standard vérifiée dans votre catégorie.",
    "Para ter uma ficha padrão verificada na sua categoria.",
    "Für einen regulären geprüften Eintrag in deiner Kategorie.",
    "Per avere una scheda standard verificata nella tua categoria."
  ],
  "USD · pago único": [
    "USD · one-time payment",
    "USD · paiement unique",
    "USD · pagamento único",
    "USD · einmalige Zahlung",
    "USD · pagamento unico"
  ],
  "Ficha en tu provincia y categoría": [
    "Listing in your province and category",
    "Fiche dans votre province et catégorie",
    "Ficha na sua província e categoria",
    "Eintrag in deiner Provinz und Kategorie",
    "Scheda nella tua provincia e categoria"
  ],
  "Contacto y enlace al mapa verificado": [
    "Contact details and verified map link",
    "Coordonnées et lien cartographique vérifié",
    "Contato e link do mapa verificado",
    "Kontakt und geprüfter Kartenlink",
    "Contatti e link alla mappa verificato"
  ],
  "Sin prioridad de publicidad": [
    "No advertising priority",
    "Sans priorité publicitaire",
    "Sem prioridade de publicidade",
    "Keine Anzeigenpriorität",
    "Nessuna priorità pubblicitaria"
  ],
  "Se publica después del pago y aprobación": [
    "Published after payment and approval",
    "Publié après paiement et approbation",
    "Publicado após pagamento e aprovação",
    "Veröffentlichung nach Zahlung und Freigabe",
    "Pubblicata dopo pagamento e approvazione"
  ],
  "Solicitar registro": [
    "Request listing",
    "Demander une inscription",
    "Solicitar cadastro",
    "Eintrag beantragen",
    "Richiedi la registrazione"
  ],
  "Plan Destacado": [
    "Featured plan",
    "Formule mise en avant",
    "Plano destaque",
    "Hervorgehobenes Paket",
    "Piano in evidenza"
  ],
  "Para que más personas de tu ciudad te encuentren.": [
    "Help more people in your city find you.",
    "Pour que davantage de personnes de votre ville vous trouvent.",
    "Para que mais pessoas da sua cidade encontrem você.",
    "Damit mehr Menschen in deiner Stadt dich finden.",
    "Per farti trovare da più persone nella tua città."
  ],
  "USD / mes": [
    "USD / month",
    "USD / mois",
    "USD / mês",
    "USD / Monat",
    "USD / mese"
  ],
  "Ficha del negocio con tus datos": [
    "Business listing with your details",
    "Fiche de l'entreprise avec vos coordonnées",
    "Ficha do negócio com seus dados",
    "Unternehmenseintrag mit deinen Angaben",
    "Scheda dell'attività con i tuoi dati"
  ],
  "Prioridad en tu categoría dentro de la provincia": [
    "Priority in your category within the province",
    "Priorité dans votre catégorie au sein de la province",
    "Prioridade na sua categoria na província",
    "Priorität in deiner Kategorie innerhalb der Provinz",
    "Priorità nella tua categoria nella provincia"
  ],
  "Enlace directo a WhatsApp y sitio web": [
    "Direct WhatsApp and website links",
    "Liens directs vers WhatsApp et le site web",
    "Links diretos para WhatsApp e site",
    "Direkte Links zu WhatsApp und Website",
    "Link diretti a WhatsApp e sito web"
  ],
  "Solicitud y seguimiento del negocio": [
    "Business request and follow-up",
    "Demande et suivi de l'entreprise",
    "Solicitação e acompanhamento do negócio",
    "Anfrage und Nachverfolgung",
    "Richiesta e monitoraggio dell'attività"
  ],
  "Elegir Destacado": [
    "Choose Featured",
    "Choisir Mise en avant",
    "Escolher Destaque",
    "Hervorgehoben wählen",
    "Scegli In evidenza"
  ],
  "MÁS VISIBILIDAD": [
    "MORE VISIBILITY",
    "PLUS DE VISIBILITÉ",
    "MAIS VISIBILIDADE",
    "MEHR SICHTBARKEIT",
    "MAGGIORE VISIBILITÀ"
  ],
  "Plan Premium": [
    "Premium plan",
    "Formule Premium",
    "Plano Premium",
    "Premium-Paket",
    "Piano Premium"
  ],
  "Para negocios que quieren dar el siguiente paso.": [
    "For businesses ready to grow.",
    "Pour les entreprises prêtes à franchir une étape.",
    "Para negócios prontos para crescer.",
    "Für Unternehmen, die weiter wachsen möchten.",
    "Per le attività pronte a crescere."
  ],
  "Incluye publicación del negocio": [
    "Includes business listing",
    "Comprend la fiche de l'entreprise",
    "Inclui publicação do negócio",
    "Unternehmenseintrag inklusive",
    "Include la pubblicazione dell'attività"
  ],
  "Prioridad en su categoría": [
    "Priority in its category",
    "Priorité dans sa catégorie",
    "Prioridade na categoria",
    "Priorität in der Kategorie",
    "Priorità nella categoria"
  ],
  "Espacio publicitario en la portada provincial": [
    "Advertising space on the provincial home page",
    "Espace publicitaire sur la page de la province",
    "Espaço publicitário na página da província",
    "Werbefläche auf der Provinzseite",
    "Spazio pubblicitario sulla pagina provinciale"
  ],
  "Espacio para ofertas destacadas": [
    "Space for featured offers",
    "Espace pour les offres mises en avant",
    "Espaço para ofertas em destaque",
    "Platz für hervorgehobene Angebote",
    "Spazio per le offerte in evidenza"
  ],
  "Elegir Premium": [
    "Choose Premium",
    "Choisir Premium",
    "Escolher Premium",
    "Premium wählen",
    "Scegli Premium"
  ],
  "Programa Socios Fundadores · Propuesta de lanzamiento": [
    "Founding Partners Program · Launch proposal",
    "Programme Partenaires fondateurs · Proposition de lancement",
    "Programa Parceiros Fundadores · Proposta de lançamento",
    "Gründungspartner-Programm · Startangebot",
    "Programma Partner fondatori · Proposta di lancio"
  ],
  "Destacado Fundador: US$200 por 12 meses": [
    "Founding Featured: US$200 for 12 months",
    "Mise en avant Fondateur : 200 USD pour 12 mois",
    "Destaque Fundador: US$200 por 12 meses",
    "Gründer-Hervorgehoben: 200 USD für 12 Monate",
    "In evidenza Fondatore: 200 USD per 12 mesi"
  ],
  "Premium Fundador: US$300 por 12 meses": [
    "Founding Premium: US$300 for 12 months",
    "Premium Fondateur : 300 USD pour 12 mois",
    "Premium Fundador: US$300 por 12 meses",
    "Gründer-Premium: 300 USD für 12 Monate",
    "Premium Fondatore: 300 USD per 12 mesi"
  ],
  "Incluye ficha y visibilidad según el plan; no garantiza ventas, visitas ni exclusividad.": [
    "Includes the listing and visibility described by the plan; does not guarantee sales, visits or exclusivity.",
    "Inclut la fiche et la visibilité prévues par l'offre ; aucune garantie de ventes, de visites ou d'exclusivité.",
    "Inclui ficha e visibilidade conforme o plano; não garante vendas, visitas ou exclusividade.",
    "Umfasst Eintrag und Sichtbarkeit gemäß Paket; keine Garantie für Verkäufe, Besuche oder Exklusivität.",
    "Include scheda e visibilità secondo il piano; non garantisce vendite, visite o esclusività."
  ],
  "Oferta informativa: no se cobra ni se activa automáticamente.": [
    "Informational offer: no automatic charge or activation.",
    "Offre informative : aucun paiement ni activation automatiques.",
    "Oferta informativa: sem cobrança nem ativação automática.",
    "Unverbindliches Angebot: keine automatische Zahlung oder Aktivierung.",
    "Offerta informativa: nessun addebito o attivazione automatica."
  ],
  "Importante:": [
    "Important:",
    "Important :",
    "Importante:",
    "Wichtig:",
    "Importante:"
  ],
  "La solicitud no es un pago: solo activaremos fichas y anuncios después de confirmar el pago y aprobar el negocio.": [
    "Submitting a request is not a payment. Listings and ads activate only after confirmed payment and approval.",
    "Une demande n'est pas un paiement. Les fiches et annonces ne sont activées qu'après paiement confirmé et approbation.",
    "Solicitar não é pagar. As fichas e anúncios serão ativados somente após confirmação do pagamento e aprovação.",
    "Eine Anfrage ist keine Zahlung. Einträge und Anzeigen werden erst nach Zahlung und Freigabe aktiviert.",
    "Una richiesta non è un pagamento. Le schede e gli annunci saranno attivati solo dopo il pagamento confermato e l'approvazione."
  ],
  "Las solicitudes se envían para revisión humana cuando el formulario está disponible. Este panel conserva una copia local; no se publican ni se cobran automáticamente.": [
    "Requests are sent for human review when the form is available. This panel keeps a local copy; requests are not automatically published or charged.",
    "Les demandes sont envoyées pour examen humain lorsque le formulaire est disponible. Une copie locale est conservée ; aucune publication ni facturation automatique.",
    "As solicitações são enviadas para análise humana quando o formulário está disponível. Uma cópia local é mantida; não há publicação ou cobrança automática.",
    "Anträge werden bei Verfügbarkeit des Formulars zur manuellen Prüfung gesendet. Eine lokale Kopie bleibt erhalten; keine automatische Veröffentlichung oder Abbuchung.",
    "Le richieste vengono inviate alla revisione umana quando il modulo è disponibile. Una copia locale viene conservata; nessuna pubblicazione o addebito automatico."
  ],
  "📍 Tu ubicación": [
    "📍 Your location",
    "📍 Votre position",
    "📍 Sua localização",
    "📍 Dein Standort",
    "📍 La tua posizione"
  ],
  "Descubre el mundo": [
    "Discover the world",
    "Découvrez le monde",
    "Descubra o mundo",
    "Entdecke die Welt",
    "Scopri il mondo"
  ],
  "Guardar favoritos": [
    "Save favorites",
    "Enregistrer les favoris",
    "Salvar favoritos",
    "Favoriten speichern",
    "Salva preferiti"
  ],
  "Fotos": [
    "Photos",
    "Photos",
    "Fotos",
    "Fotos",
    "Foto"
  ],
  "Fotografías": [
    "Photos",
    "Photos",
    "Fotografias",
    "Fotos",
    "Fotografie"
  ]
});

// Report-place and excursion registration forms.
Object.assign(labels, {
  "EXPLORA EL MUNDO": [
    "EXPLORE THE WORLD",
    "EXPLOREZ LE MONDE",
    "EXPLORE O MUNDO",
    "ENTDECKE DIE WELT",
    "ESPLORA IL MONDO"
  ],
  "WHERE TO GO · EXPLORA EL MUNDO": [
    "WHERE TO GO · EXPLORE THE WORLD",
    "WHERE TO GO · EXPLOREZ LE MONDE",
    "WHERE TO GO · EXPLORE O MUNDO",
    "WHERE TO GO · ENTDECKE DIE WELT",
    "WHERE TO GO · ESPLORA IL MONDO"
  ],
  "WHERE TO GO · REPÚBLICA DOMINICANA": [
    "WHERE TO GO · DOMINICAN REPUBLIC",
    "WHERE TO GO · RÉPUBLIQUE DOMINICAINE",
    "WHERE TO GO · REPÚBLICA DOMINICANA",
    "WHERE TO GO · DOMINIKANISCHE REPUBLIK",
    "WHERE TO GO · REPUBBLICA DOMINICANA"
  ],
  "INSPIRACIÓN PARA TU PRÓXIMO VIAJE": [
    "INSPIRATION FOR YOUR NEXT TRIP",
    "INSPIRATION POUR VOTRE PROCHAIN VOYAGE",
    "INSPIRAÇÃO PARA SUA PRÓXIMA VIAGEM",
    "INSPIRATION FÜR DEINE NÄCHSTE REISE",
    "ISPIRAZIONE PER IL PROSSIMO VIAGGIO"
  ],
  "Playas": [
    "Beaches",
    "Plages",
    "Praias",
    "Strände",
    "Spiagge"
  ],
  "Cascadas": [
    "Waterfalls",
    "Cascades",
    "Cachoeiras",
    "Wasserfälle",
    "Cascate"
  ],
  "Restaurantes": [
    "Restaurants",
    "Restaurants",
    "Restaurantes",
    "Restaurants",
    "Ristoranti"
  ],
  "Hoteles": [
    "Hotels",
    "Hôtels",
    "Hotéis",
    "Hotels",
    "Hotel"
  ],
  "Ríos": [
    "Rivers",
    "Rivières",
    "Rios",
    "Flüsse",
    "Fiumi"
  ],
  "Atractivos": [
    "Attractions",
    "Attractions",
    "Atrações",
    "Sehenswürdigkeiten",
    "Attrazioni"
  ],
  "Discotecas": [
    "Nightclubs",
    "Discothèques",
    "Boates",
    "Nachtclubs",
    "Discoteche"
  ],
  "Bares": [
    "Bars",
    "Bars",
    "Bares",
    "Bars",
    "Bar"
  ],
  "Cafeterías": [
    "Cafés",
    "Cafés",
    "Cafeterias",
    "Cafés",
    "Caffetterie"
  ],
  "Transporte": [
    "Transport",
    "Transports",
    "Transporte",
    "Transport",
    "Trasporti"
  ],
  "Tours": [
    "Tours",
    "Excursions",
    "Passeios",
    "Touren",
    "Tour"
  ],
  "A 60 km": [
    "Within 60 km",
    "Dans un rayon de 60 km",
    "Até 60 km",
    "Im Umkreis von 60 km",
    "Entro 60 km"
  ],
  "A 100 km": [
    "Within 100 km",
    "Dans un rayon de 100 km",
    "Até 100 km",
    "Im Umkreis von 100 km",
    "Entro 100 km"
  ],
  "Cargando municipios...": [
    "Loading municipalities...",
    "Chargement des communes...",
    "Carregando municípios...",
    "Gemeinden werden geladen...",
    "Caricamento comuni..."
  ],
  "Permiso de ubicación solo al usar el botón o si ya lo concediste antes. Requiere HTTPS. La búsqueda y geocodificación pueden enviar coordenadas a proveedores de mapas; no guardamos tu GPS en una cuenta.": [
    "Location is requested only when you tap the button or previously granted permission. Requires HTTPS. Search and geocoding may send coordinates to map providers; we do not store your GPS location in an account.",
    "La position n'est demandée qu'après action de votre part ou autorisation préalable. HTTPS requis. La recherche peut transmettre les coordonnées aux fournisseurs de cartes ; nous ne stockons pas votre GPS dans un compte.",
    "A localização é solicitada apenas ao tocar no botão ou se já houver permissão. Requer HTTPS. Busca e geocodificação podem enviar coordenadas aos mapas; não guardamos seu GPS em uma conta.",
    "Der Standort wird nur nach Tippen oder bestehender Berechtigung angefragt. HTTPS erforderlich. Suche und Geokodierung können Koordinaten an Kartenanbieter übermitteln; wir speichern deinen GPS-Standort nicht in einem Konto.",
    "La posizione viene richiesta solo quando tocchi il pulsante o se hai già autorizzato. Richiede HTTPS. La ricerca può inviare coordinate ai fornitori di mappe; non salviamo il GPS nell'account."
  ],
  "Ayúdanos a completar Where to Go": [
    "Help us improve Where to Go",
    "Aidez-nous à enrichir Where to Go",
    "Ajude a melhorar o Where to Go",
    "Hilf uns, Where to Go zu verbessern",
    "Aiutaci a migliorare Where to Go"
  ],
  "Proporciona información verificable. Nunca publicamos lugares ni imágenes sin revisar.": [
    "Share verifiable information. We never publish places or photos without review.",
    "Fournissez des informations vérifiables. Nous ne publions aucun lieu ou photo sans vérification.",
    "Forneça informações verificáveis. Nunca publicamos locais ou fotos sem revisão.",
    "Teile überprüfbare Angaben. Orte und Bilder veröffentlichen wir erst nach Prüfung.",
    "Fornisci informazioni verificabili. Non pubblichiamo luoghi o foto senza verifica."
  ],
  "Nombre del lugar *": [
    "Place name *",
    "Nom du lieu *",
    "Nome do lugar *",
    "Name des Ortes *",
    "Nome del luogo *"
  ],
  "Provincia *": [
    "Province *",
    "Province *",
    "Província *",
    "Provinz *",
    "Provincia *"
  ],
  "Municipio o localidad *": [
    "Municipality or town *",
    "Commune ou localité *",
    "Município ou localidade *",
    "Gemeinde oder Ort *",
    "Comune o località *"
  ],
  "Enlace a ubicación precisa (OSM, Waze o Maps)": [
    "Link to precise location (OSM, Waze or Maps)",
    "Lien vers l'emplacement exact (OSM, Waze ou Maps)",
    "Link da localização exata (OSM, Waze ou Maps)",
    "Link zum genauen Standort (OSM, Waze oder Maps)",
    "Link alla posizione esatta (OSM, Waze o Maps)"
  ],
  "Subir una fotografía propia o autorizada (máximo 6 MB)": [
    "Upload your own or authorized photo (max 6 MB)",
    "Ajouter votre photo ou une photo autorisée (6 Mo max)",
    "Enviar foto própria ou autorizada (máx. 6 MB)",
    "Eigenes oder genehmigtes Foto hochladen (max. 6 MB)",
    "Carica una foto propria o autorizzata (max 6 MB)"
  ],
  "O enlace a una fotografía autorizada": [
    "Or link to an authorized photo",
    "Ou lien vers une photo autorisée",
    "Ou link para uma foto autorizada",
    "Oder Link zu einem genehmigten Foto",
    "Oppure link a una foto autorizzata"
  ],
  "Detalles para verificar": [
    "Details for verification",
    "Détails à vérifier",
    "Detalhes para verificação",
    "Angaben zur Prüfung",
    "Dettagli da verificare"
  ],
  "Contacto para aclaraciones (opcional)": [
    "Contact for follow-up (optional)",
    "Contact pour précisions (facultatif)",
    "Contato para esclarecimentos (opcional)",
    "Kontakt für Rückfragen (optional)",
    "Contatto per chiarimenti (facoltativo)"
  ],
  "Confirmo que mis datos son correctos y que tengo permiso para compartir la foto, si adjunto una.": [
    "I confirm my details are accurate and I have permission to share any attached photo.",
    "Je confirme l'exactitude des informations et avoir l'autorisation de partager la photo jointe.",
    "Confirmo que os dados estão corretos e tenho permissão para compartilhar qualquer foto anexada.",
    "Ich bestätige die Richtigkeit meiner Angaben und die Berechtigung zur Weitergabe angehängter Fotos.",
    "Confermo che i dati sono corretti e di avere il permesso di condividere le foto allegate."
  ],
  "El envío requiere confirmación del sistema. Las solicitudes no se publican automáticamente. No subas fotos de niños ni información privada de terceros.": [
    "Submission requires confirmation. Requests are not published automatically. Do not upload photos of children or others' private information.",
    "L'envoi nécessite une confirmation. Les demandes ne sont pas publiées automatiquement. Ne téléversez pas de photos d'enfants ou de données privées de tiers.",
    "O envio exige confirmação. As solicitações não são publicadas automaticamente. Não envie fotos de crianças ou dados privados de terceiros.",
    "Das Absenden erfordert eine Bestätigung. Anträge werden nicht automatisch veröffentlicht. Keine Kinderfotos oder privaten Daten Dritter hochladen.",
    "L'invio richiede conferma. Le richieste non sono pubblicate automaticamente. Non caricare foto di minori o dati privati di terzi."
  ],
  "Enviar para revisión": [
    "Submit for review",
    "Envoyer pour vérification",
    "Enviar para revisão",
    "Zur Prüfung senden",
    "Invia per la verifica"
  ],
  "Publica tu tour o excursión": [
    "List your tour or excursion",
    "Publiez votre visite ou excursion",
    "Publique seu passeio ou excursão",
    "Tour oder Ausflug veröffentlichen",
    "Pubblica il tuo tour o la tua escursione"
  ],
  "US$10 mensuales por anuncio. Se publica únicamente tras verificación del organizador, revisión del contenido y pago confirmado.": [
    "US$10 per month per listing. Published only after organizer verification, content review and payment confirmation.",
    "10 USD par mois et par annonce. Publication uniquement après vérification de l'organisateur, examen du contenu et confirmation du paiement.",
    "US$10 por mês por anúncio. Publicação apenas após verificação do organizador, revisão do conteúdo e confirmação do pagamento.",
    "10 USD monatlich pro Eintrag. Veröffentlichung erst nach Veranstalterprüfung, Inhaltsprüfung und bestätigter Zahlung.",
    "10 USD al mese per annuncio. Pubblicazione solo dopo verifica dell'organizzatore, revisione dei contenuti e conferma del pagamento."
  ],
  "Nombre de la excursión *": [
    "Tour or excursion name *",
    "Nom de la visite ou excursion *",
    "Nome do passeio ou excursão *",
    "Name der Tour oder des Ausflugs *",
    "Nome del tour o dell'escursione *"
  ],
  "Nombre legal del organizador *": [
    "Organizer's legal name *",
    "Nom légal de l'organisateur *",
    "Nome legal do organizador *",
    "Rechtlicher Name des Veranstalters *",
    "Nome legale dell'organizzatore *"
  ],
  "Teléfono / WhatsApp verificable *": [
    "Verifiable phone / WhatsApp *",
    "Téléphone / WhatsApp vérifiable *",
    "Telefone / WhatsApp verificável *",
    "Verifizierbares Telefon / WhatsApp *",
    "Telefono / WhatsApp verificabile *"
  ],
  "Correo de contacto *": [
    "Contact email *",
    "E-mail de contact *",
    "E-mail de contato *",
    "Kontakt-E-Mail *",
    "Email di contatto *"
  ],
  "País donde se realiza *": [
    "Country where the activity takes place *",
    "Pays où se déroule l'activité *",
    "País onde a atividade ocorre *",
    "Land, in dem die Aktivität stattfindet *",
    "Paese in cui si svolge l'attività *"
  ],
  "Provincia / región donde se realiza *": [
    "Province / region of the activity *",
    "Province / région de l'activité *",
    "Província / região da atividade *",
    "Provinz / Region der Aktivität *",
    "Provincia / regione dell'attività *"
  ],
  "Ciudad / municipio *": [
    "City / municipality *",
    "Ville / commune *",
    "Cidade / município *",
    "Stadt / Gemeinde *",
    "Città / comune *"
  ],
  "Lugar exacto de salida *": [
    "Exact departure location *",
    "Lieu de départ exact *",
    "Local exato de saída *",
    "Genauer Abfahrtsort *",
    "Punto di partenza esatto *"
  ],
  "Hora de salida *": [
    "Departure time *",
    "Heure de départ *",
    "Horário de saída *",
    "Abfahrtszeit *",
    "Ora di partenza *"
  ],
  "Fecha de salida *": [
    "Departure date *",
    "Date de départ *",
    "Data de saída *",
    "Abfahrtsdatum *",
    "Data di partenza *"
  ],
  "Destino o paradas *": [
    "Destination or stops *",
    "Destination ou arrêts *",
    "Destino ou paradas *",
    "Ziel oder Zwischenstopps *",
    "Destinazione o tappe *"
  ],
  "Hora aproximada de regreso *": [
    "Approximate return time *",
    "Heure de retour approximative *",
    "Horário aproximado de volta *",
    "Ungefähre Rückkehrzeit *",
    "Orario approssimativo di ritorno *"
  ],
  "Precio por persona *": [
    "Price per person *",
    "Prix par personne *",
    "Preço por pessoa *",
    "Preis pro Person *",
    "Prezzo a persona *"
  ],
  "Cupos disponibles *": [
    "Available spaces *",
    "Places disponibles *",
    "Vagas disponíveis *",
    "Verfügbare Plätze *",
    "Posti disponibili *"
  ],
  "Qué incluye *": [
    "What's included *",
    "Ce qui est inclus *",
    "O que inclui *",
    "Enthaltene Leistungen *",
    "Cosa include *"
  ],
  "Qué NO incluye *": [
    "What's NOT included *",
    "Ce qui n'est PAS inclus *",
    "O que NÃO inclui *",
    "Nicht enthalten *",
    "Cosa NON include *"
  ],
  "Descripción e itinerario *": [
    "Description and itinerary *",
    "Description et itinéraire *",
    "Descrição e itinerário *",
    "Beschreibung und Reiseverlauf *",
    "Descrizione e itinerario *"
  ],
  "Política de cancelación y reembolso *": [
    "Cancellation and refund policy *",
    "Politique d'annulation et de remboursement *",
    "Política de cancelamento e reembolso *",
    "Stornierungs- und Erstattungsregeln *",
    "Politica di cancellazione e rimborso *"
  ],
  "Información de seguridad, responsable y contacto de emergencia *": [
    "Safety information, organizer and emergency contact *",
    "Informations de sécurité, responsable et contact d'urgence *",
    "Informações de segurança, responsável e contato de emergência *",
    "Sicherheitsinformationen, Verantwortliche und Notfallkontakt *",
    "Informazioni sulla sicurezza, responsabile e contatto d'emergenza *"
  ],
  "Hasta 5 fotografías propias o autorizadas *": [
    "Up to 5 owned or authorized photos *",
    "Jusqu'à 5 photos personnelles ou autorisées *",
    "Até 5 fotos próprias ou autorizadas *",
    "Bis zu 5 eigene oder genehmigte Fotos *",
    "Fino a 5 foto proprie o autorizzate *"
  ],
  "Selecciona de 1 a 5 fotos, máximo 5 MB por foto. Las imágenes se revisan antes de publicar.": [
    "Choose 1 to 5 photos, up to 5 MB each. Images are reviewed before publication.",
    "Choisissez 1 à 5 photos de 5 Mo maximum chacune. Les images seront vérifiées avant publication.",
    "Escolha de 1 a 5 fotos, máximo 5 MB cada. As imagens serão revisadas antes da publicação.",
    "Wähle 1 bis 5 Fotos mit maximal 5 MB pro Foto. Bilder werden vor der Veröffentlichung geprüft.",
    "Scegli da 1 a 5 foto, massimo 5 MB ciascuna. Le immagini saranno verificate prima della pubblicazione."
  ],
  "Confirmo que tengo autorización para ofrecer la actividad, que la información es correcta y que tengo derechos de uso sobre las fotografías.": [
    "I confirm I am authorized to offer this activity, all information is accurate, and I have rights to use the photos.",
    "Je confirme être autorisé à proposer cette activité, que les informations sont exactes et que je dispose des droits sur les photos.",
    "Confirmo autorização para oferecer a atividade, que as informações estão corretas e que tenho direitos sobre as fotos.",
    "Ich bestätige, dass ich die Aktivität anbieten darf, alle Angaben korrekt sind und ich die Bildrechte besitze.",
    "Confermo di essere autorizzato a offrire l'attività, che le informazioni sono corrette e che ho i diritti sulle foto."
  ],
  "La solicitud no implica cobro ni publicación automática. Los anuncios solo se mostrarán en el país y provincia correspondientes, una vez exista la infraestructura de publicación y filtrado.": [
    "Submitting a request does not trigger a charge or publication. Listings will appear only in the corresponding country and province once publishing and filtering are available.",
    "L'envoi n'entraîne ni facturation ni publication automatique. Les annonces apparaîtront uniquement dans le pays et la province concernés, une fois l'infrastructure disponible.",
    "O envio não gera cobrança nem publicação automática. Anúncios aparecerão apenas no país e província correspondentes quando a infraestrutura estiver disponível.",
    "Eine Anfrage führt weder zu Abbuchung noch zur Veröffentlichung. Anzeigen erscheinen erst nach Bereitstellung der Infrastruktur im richtigen Land und der richtigen Provinz.",
    "L'invio non comporta addebiti né pubblicazione automatica. Gli annunci appariranno solo nel paese e nella provincia corretti quando l'infrastruttura sarà disponibile."
  ],
  "Enviar solicitud para revisión": [
    "Submit request for review",
    "Envoyer la demande pour vérification",
    "Enviar solicitação para revisão",
    "Anfrage zur Prüfung senden",
    "Invia la richiesta per la verifica"
  ]
});

// Business submission, account, privacy and legal notices.
Object.assign(labels, {
  "Solicita tu registro empresarial": [
    "Request a business listing",
    "Demandez l'inscription de votre entreprise",
    "Solicite o cadastro da sua empresa",
    "Unternehmenseintrag beantragen",
    "Richiedi la registrazione della tua attività"
  ],
  "Elige un plan. Solo se publicará la ficha tras revisión y confirmación del pago.": [
    "Choose a plan. Your listing will be published only after review and confirmed payment.",
    "Choisissez une formule. Votre fiche sera publiée uniquement après examen et confirmation du paiement.",
    "Escolha um plano. A ficha será publicada apenas após revisão e confirmação do pagamento.",
    "Wähle ein Paket. Dein Eintrag wird erst nach Prüfung und Zahlungsbestätigung veröffentlicht.",
    "Scegli un piano. La scheda sarà pubblicata solo dopo verifica e conferma del pagamento."
  ],
  "Nombre del negocio *": [
    "Business name *",
    "Nom de l'entreprise *",
    "Nome do negócio *",
    "Name des Unternehmens *",
    "Nome dell'attività *"
  ],
  "Categoría *": [
    "Category *",
    "Catégorie *",
    "Categoria *",
    "Kategorie *",
    "Categoria *"
  ],
  "Dirección *": [
    "Address *",
    "Adresse *",
    "Endereço *",
    "Adresse *",
    "Indirizzo *"
  ],
  "WhatsApp / teléfono *": [
    "WhatsApp / phone *",
    "WhatsApp / téléphone *",
    "WhatsApp / telefone *",
    "WhatsApp / Telefon *",
    "WhatsApp / telefono *"
  ],
  "Enlace de Google Maps, Waze u OSM (opcional)": [
    "Google Maps, Waze or OSM link (optional)",
    "Lien Google Maps, Waze ou OSM (facultatif)",
    "Link Google Maps, Waze ou OSM (opcional)",
    "Google Maps-, Waze- oder OSM-Link (optional)",
    "Link Google Maps, Waze o OSM (facoltativo)"
  ],
  "Enlace a una foto propia autorizada (opcional)": [
    "Link to your own authorized photo (optional)",
    "Lien vers votre photo autorisée (facultatif)",
    "Link da sua foto autorizada (opcional)",
    "Link zu eigenem genehmigtem Foto (optional)",
    "Link a una foto autorizzata (facoltativo)"
  ],
  "Hasta cuatro enlaces a fotos adicionales autorizadas (uno por línea)": [
    "Up to four links to additional authorized photos (one per line)",
    "Jusqu'à quatre liens vers d'autres photos autorisées (un par ligne)",
    "Até quatro links para fotos adicionais autorizadas (um por linha)",
    "Bis zu vier Links zu weiteren genehmigten Fotos (einer pro Zeile)",
    "Fino a quattro link a foto aggiuntive autorizzate (uno per riga)"
  ],
  "Plan deseado": [
    "Preferred plan",
    "Formule souhaitée",
    "Plano desejado",
    "Gewünschtes Paket",
    "Piano desiderato"
  ],
  "Registro Básico · US$10 una vez": [
    "Basic listing · US$10 once",
    "Inscription de base · 10 USD une fois",
    "Cadastro básico · US$10 uma vez",
    "Basiseintrag · einmalig 10 USD",
    "Registrazione base · 10 USD una tantum"
  ],
  "Destacado · US$30/mes": [
    "Featured · US$30/month",
    "Mise en avant · 30 USD/mois",
    "Destaque · US$30/mês",
    "Hervorgehoben · 30 USD/Monat",
    "In evidenza · 30 USD/mese"
  ],
  "Premium · US$50/mes": [
    "Premium · US$50/month",
    "Premium · 50 USD/mois",
    "Premium · US$50/mês",
    "Premium · 50 USD/Monat",
    "Premium · 50 USD/mese"
  ],
  "Descripción": [
    "Description",
    "Description",
    "Descrição",
    "Beschreibung",
    "Descrizione"
  ],
  "Confirmo que soy propietario o representante autorizado y que puedo compartir estos datos para revisión.": [
    "I confirm that I own or am authorized to represent this business and may submit these details for review.",
    "Je confirme être propriétaire ou représentant autorisé et pouvoir transmettre ces informations pour examen.",
    "Confirmo ser proprietário ou representante autorizado e poder enviar esses dados para revisão.",
    "Ich bestätige, Inhaber oder bevollmächtigter Vertreter zu sein und diese Angaben zur Prüfung weitergeben zu dürfen.",
    "Confermo di essere proprietario o rappresentante autorizzato e di poter condividere questi dati per la verifica."
  ],
  "Al enviar, el negocio se remite para revisión humana mediante Netlify Forms, si está activo. La solicitud no es un cobro: después de revisar el negocio, confirmaremos el precio y el pago. No se publica automáticamente; se guarda una copia local.": [
    "If Netlify Forms is enabled, the request is sent for manual review. Submitting does not charge you; the price and payment are confirmed later. Nothing is published automatically, and a local copy is saved.",
    "Si Netlify Forms est activé, la demande est envoyée pour vérification manuelle. Aucun paiement n'est effectué lors de l'envoi ; le tarif sera confirmé ensuite. Publication non automatique et copie locale conservée.",
    "Se Netlify Forms estiver ativo, o pedido será enviado para revisão humana. O envio não gera cobrança; o preço e o pagamento serão confirmados depois. Nada é publicado automaticamente; uma cópia local é salva.",
    "Ist Netlify Forms aktiviert, wird die Anfrage manuell geprüft. Das Absenden löst keine Zahlung aus; Preis und Zahlung werden später bestätigt. Keine automatische Veröffentlichung; eine lokale Kopie wird gespeichert.",
    "Se Netlify Forms è attivo, la richiesta viene inviata per revisione manuale. L'invio non comporta addebiti; prezzo e pagamento saranno confermati successivamente. Nessuna pubblicazione automatica; viene salvata una copia locale."
  ],
  "Enviar solicitud de registro": [
    "Submit listing request",
    "Envoyer la demande d'inscription",
    "Enviar solicitação de cadastro",
    "Eintrag beantragen",
    "Invia richiesta di registrazione"
  ],
  "Mi cuenta": [
    "My account",
    "Mon compte",
    "Minha conta",
    "Mein Konto",
    "Il mio account"
  ],
  "Comprobando sesión…": [
    "Checking your session…",
    "Vérification de votre session…",
    "Verificando sua sessão…",
    "Sitzung wird geprüft…",
    "Verifica della sessione…"
  ],
  "Mis lugares favoritos": [
    "My favorite places",
    "Mes lieux favoris",
    "Meus lugares favoritos",
    "Meine Lieblingsorte",
    "I miei luoghi preferiti"
  ],
  "Reenviar confirmación de correo": [
    "Resend email confirmation",
    "Renvoyer l'e-mail de confirmation",
    "Reenviar confirmação por e-mail",
    "Bestätigungs-E-Mail erneut senden",
    "Invia di nuovo l'email di conferma"
  ],
  "Cambiar contraseña por correo": [
    "Change password by email",
    "Modifier le mot de passe par e-mail",
    "Alterar senha por e-mail",
    "Passwort per E-Mail ändern",
    "Modifica la password via email"
  ],
  "Privacidad y condiciones": [
    "Privacy and terms",
    "Confidentialité et conditions",
    "Privacidade e condições",
    "Datenschutz und Bedingungen",
    "Privacy e condizioni"
  ],
  "Cerrar sesión": [
    "Sign out",
    "Se déconnecter",
    "Sair da conta",
    "Abmelden",
    "Esci"
  ],
  "Ver pantalla de inicio de sesión": [
    "Open sign-in screen",
    "Afficher l'écran de connexion",
    "Abrir tela de login",
    "Anmeldebildschirm öffnen",
    "Apri la schermata di accesso"
  ],
  "Privacidad y condiciones — versión de prueba": [
    "Privacy and terms — preview version",
    "Confidentialité et conditions — version de test",
    "Privacidade e condições — versão de teste",
    "Datenschutz und Bedingungen — Testversion",
    "Privacy e condizioni — versione di prova"
  ],
  "Información que tratamos": [
    "Information we process",
    "Informations que nous traitons",
    "Informações que tratamos",
    "Daten, die wir verarbeiten",
    "Dati che trattiamo"
  ],
  "Usamos un servicio de cuentas para iniciar sesión. Si aceptas la personalización, podemos guardar tus lugares vistos y favoritos vinculados a tu cuenta. Consulta nuestra Política de privacidad para conocer los proveedores involucrados.": [
    "We use an account service for sign-in. With your consent, viewed places and favorites may be linked to your account. See our Privacy Policy for the providers involved.",
    "Nous utilisons un service de compte pour la connexion. Avec votre accord, lieux consultés et favoris peuvent être liés à votre compte. Consultez notre Politique de confidentialité pour les fournisseurs concernés.",
    "Usamos um serviço de contas para login. Com seu consentimento, locais vistos e favoritos podem ser vinculados à sua conta. Consulte nossa Política de Privacidade para saber quais fornecedores estão envolvidos.",
    "Wir nutzen einen Kontodienst für die Anmeldung. Mit deiner Einwilligung können angesehene Orte und Favoriten mit deinem Konto verknüpft werden. Anbieter sind in der Datenschutzerklärung genannt.",
    "Utilizziamo un servizio account per l'accesso. Con il tuo consenso, luoghi visualizzati e preferiti possono essere collegati al tuo account. Consulta l'Informativa sulla privacy per i fornitori coinvolti."
  ],
  "Control de tus datos": [
    "Control of your data",
    "Contrôle de vos données",
    "Controle dos seus dados",
    "Kontrolle über deine Daten",
    "Controllo dei tuoi dati"
  ],
  "Puedes cerrar sesión y desactivar la personalización. Para solicitar acceso, corrección o eliminación de datos, necesitamos habilitar un canal de atención verificado antes del lanzamiento público.": [
    "You can sign out and disable personalization. A verified support channel for requests to access, correct or delete data must be enabled before public launch.",
    "Vous pouvez vous déconnecter et désactiver la personnalisation. Un canal de contact vérifié pour accéder, corriger ou supprimer les données doit être mis en place avant le lancement.",
    "Você pode sair e desativar a personalização. Um canal de atendimento verificado para acessar, corrigir ou excluir dados deverá estar ativo antes do lançamento público.",
    "Du kannst dich abmelden und die Personalisierung deaktivieren. Vor dem öffentlichen Start muss ein geprüfter Kontaktweg für Auskunft, Berichtigung oder Löschung bereitstehen.",
    "Puoi uscire e disattivare la personalizzazione. Prima del lancio pubblico occorre un canale verificato per richiedere accesso, rettifica o cancellazione dei dati."
  ],
  "Condiciones de uso": [
    "Terms of use",
    "Conditions d'utilisation",
    "Condições de uso",
    "Nutzungsbedingungen",
    "Condizioni d'uso"
  ],
  "Where to Go está en fase de prueba. Las fichas, fotos, horarios, precios y excursiones deben comprobarse con el proveedor. Ninguna excursión está certificada como segura por aparecer aquí. Los anuncios requieren revisión y pago confirmado antes de publicarse.": [
    "Where to Go is in testing. Verify listings, photos, hours, prices and excursions with the provider. An excursion is not certified safe by appearing here. Ads require review and confirmed payment before publication.",
    "Where to Go est en phase de test. Vérifiez les fiches, photos, horaires, prix et excursions auprès des prestataires. Une excursion n'est pas certifiée sûre du seul fait de sa présence. Les annonces nécessitent vérification et paiement confirmé.",
    "Where to Go está em teste. Verifique fichas, fotos, horários, preços e excursões com o prestador. Aparecer aqui não certifica a segurança de uma excursão. Anúncios exigem revisão e pagamento confirmado.",
    "Where to Go befindet sich in der Testphase. Prüfe Einträge, Fotos, Öffnungszeiten, Preise und Ausflüge beim Anbieter. Ein Eintrag ist keine Sicherheitszertifizierung. Anzeigen erfordern Prüfung und bestätigte Zahlung.",
    "Where to Go è in fase di test. Verifica schede, foto, orari, prezzi ed escursioni con il fornitore. La presenza qui non certifica la sicurezza di un'escursione. Gli annunci richiedono revisione e pagamento confermato."
  ],
  "Aviso:": [
    "Notice:",
    "Avis :",
    "Aviso:",
    "Hinweis:",
    "Avviso:"
  ],
  "este resumen provisional no sustituye una política legal definitiva ni constituye consentimiento automático para nuevos tratamientos.": [
    "this provisional summary is not a final legal policy and does not constitute automatic consent to further data processing.",
    "ce résumé provisoire ne remplace pas une politique juridique définitive et ne vaut pas consentement automatique à d'autres traitements.",
    "este resumo provisório não substitui uma política jurídica definitiva nem representa consentimento automático para novos tratamentos.",
    "diese vorläufige Zusammenfassung ersetzt keine endgültige Rechtserklärung und stellt keine automatische Einwilligung in weitere Datenverarbeitung dar.",
    "questa sintesi provvisoria non sostituisce un'informativa legale definitiva né costituisce consenso automatico a ulteriori trattamenti."
  ]
});

// Location selection and remaining dynamic interaction labels.
Object.assign(labels, {
  "TRANSPORTE · SOCIO FUNDADOR · PUERTO PLATA": [
    "TRANSPORT · FOUNDING PARTNER · PUERTO PLATA",
    "TRANSPORT · PARTENAIRE FONDATEUR · PUERTO PLATA",
    "TRANSPORTE · PARCEIRO FUNDADOR · PUERTO PLATA",
    "TRANSPORT · GRÜNDUNGSPARTNER · PUERTO PLATA",
    "TRASPORTO · PARTNER FONDATORE · PUERTO PLATA"
  ],
  "WHERE TO GO · TRANSPORTE": [
    "WHERE TO GO · TRANSPORT",
    "WHERE TO GO · TRANSPORTS",
    "WHERE TO GO · TRANSPORTE",
    "WHERE TO GO · TRANSPORT",
    "WHERE TO GO · TRASPORTI"
  ],
  "No llenar": [
    "Do not fill in",
    "Ne pas remplir",
    "Não preencher",
    "Nicht ausfüllen",
    "Non compilare"
  ],
  "Selecciona una ciudad o municipio": [
    "Choose a city or municipality",
    "Choisissez une ville ou une commune",
    "Escolha uma cidade ou município",
    "Stadt oder Gemeinde auswählen",
    "Scegli una città o un comune"
  ],
  "32 demarcaciones y 158 municipios disponibles. Elige una provincia y una ciudad para explorar.": [
    "32 areas and 158 municipalities available. Choose a province and city to explore.",
    "32 zones et 158 communes disponibles. Choisissez une province et une ville.",
    "32 áreas e 158 municípios disponíveis. Escolha uma província e uma cidade.",
    "32 Gebiete und 158 Gemeinden verfügbar. Wähle eine Provinz und Stadt.",
    "32 aree e 158 comuni disponibili. Scegli una provincia e una città."
  ],
  "32 demarcaciones disponibles. Se está cargando el índice de los 158 municipios.": [
    "32 areas available. Loading the index of 158 municipalities.",
    "32 zones disponibles. Chargement de l'index des 158 communes.",
    "32 áreas disponíveis. Carregando o índice de 158 municípios.",
    "32 Gebiete verfügbar. Das Verzeichnis mit 158 Gemeinden wird geladen.",
    "32 aree disponibili. Caricamento dell'elenco di 158 comuni."
  ],
  "Este país todavía no tiene regiones y ciudades precargadas.": [
    "This country does not have preloaded regions and cities yet.",
    "Ce pays n'a pas encore de régions ou de villes préchargées.",
    "Este país ainda não tem regiões e cidades pré-carregadas.",
    "Für dieses Land sind noch keine Regionen und Städte vorgeladen.",
    "Questo paese non dispone ancora di regioni e città precaricate."
  ],
  "República Dominicana: elige la provincia y luego la ciudad o municipio.": [
    "Dominican Republic: choose a province, then a city or municipality.",
    "République dominicaine : choisissez une province, puis une ville ou commune.",
    "República Dominicana: escolha a província, depois a cidade ou município.",
    "Dominikanische Republik: Wähle zuerst die Provinz, dann die Stadt oder Gemeinde.",
    "Repubblica Dominicana: scegli la provincia e poi la città o il comune."
  ],
  "Selecciona una ciudad para buscar lugares reales con Google Places.": [
    "Choose a city to search for real places with Google Places.",
    "Choisissez une ville pour rechercher des lieux réels avec Google Places.",
    "Escolha uma cidade para buscar lugares reais no Google Places.",
    "Wähle eine Stadt, um echte Orte mit Google Places zu suchen.",
    "Scegli una città per cercare luoghi reali con Google Places."
  ],
  "Este país no tiene todavía un índice de ciudades verificadas. No se mostrarán ubicaciones inventadas.": [
    "This country has no verified city index yet. No invented locations will be shown.",
    "Ce pays n'a pas encore d'index de villes vérifiées. Aucun lieu inventé ne sera affiché.",
    "Este país ainda não tem índice de cidades verificadas. Nenhuma localização inventada será exibida.",
    "Für dieses Land gibt es noch kein geprüftes Stadtverzeichnis. Es werden keine erfundenen Orte angezeigt.",
    "Questo paese non ha ancora un elenco verificato di città. Non mostreremo luoghi inventati."
  ],
  "Explorar destino en República Dominicana": [
    "Explore destination in the Dominican Republic",
    "Explorer une destination en République dominicaine",
    "Explorar destino na República Dominicana",
    "Reiseziel in der Dominikanischen Republik entdecken",
    "Esplora destinazione nella Repubblica Dominicana"
  ],
  "Explorar destino seleccionado": [
    "Explore selected destination",
    "Explorer la destination choisie",
    "Explorar destino selecionado",
    "Gewähltes Reiseziel erkunden",
    "Esplora la destinazione selezionata"
  ],
  "Selecciona una provincia y una ciudad para ver lugares cercanos.": [
    "Choose a province and city to see nearby places.",
    "Choisissez une province et une ville pour voir les lieux proches.",
    "Escolha uma província e uma cidade para ver lugares próximos.",
    "Wähle Provinz und Stadt, um Orte in der Nähe zu sehen.",
    "Scegli una provincia e una città per vedere luoghi vicini."
  ],
  "Comprobando ubicación del destino…": [
    "Checking destination location…",
    "Vérification de l'emplacement…",
    "Verificando a localização…",
    "Standort des Reiseziels wird geprüft…",
    "Verifica della posizione della destinazione…"
  ],
  "Esta ciudad todavía no tiene coordenadas comprobadas.": [
    "This city does not have verified coordinates yet.",
    "Cette ville n'a pas encore de coordonnées vérifiées.",
    "Esta cidade ainda não tem coordenadas verificadas.",
    "Für diese Stadt gibt es noch keine geprüften Koordinaten.",
    "Questa città non ha ancora coordinate verificate."
  ],
  "Selecciona una provincia y un municipio válidos.": [
    "Choose a valid province and municipality.",
    "Choisissez une province et une commune valides.",
    "Escolha uma província e um município válidos.",
    "Wähle eine gültige Provinz und Gemeinde.",
    "Scegli una provincia e un comune validi."
  ],
  "El localizador territorial no se cargó. Intenta actualizar la aplicación.": [
    "Location data could not be loaded. Try refreshing the app.",
    "Le service de localisation n'a pas pu se charger. Réactualisez l'application.",
    "Os dados de localização não carregaram. Atualize o aplicativo.",
    "Der Ortungsdienst konnte nicht geladen werden. Bitte App aktualisieren.",
    "Impossibile caricare il servizio di localizzazione. Aggiorna l'app."
  ],
  "No se pudo seleccionar el destino.": [
    "Could not select destination.",
    "Impossible de choisir la destination.",
    "Não foi possível selecionar o destino.",
    "Reiseziel konnte nicht ausgewählt werden.",
    "Impossibile selezionare la destinazione."
  ],
  "(precio normal US$360 por 12 meses).": [
    "(regular price US$360 for 12 months).",
    "(prix habituel 360 USD pour 12 mois).",
    "(preço normal US$360 por 12 meses).",
    "(regulärer Preis 360 USD für 12 Monate).",
    "(prezzo normale 360 USD per 12 mesi)."
  ],
  "(precio normal US$600 por 12 meses). Cupos propuestos: 50 negocios inicialmente, ampliables a 100. El plazo empieza con el lanzamiento comercial, sujeto a contrato y fecha de activación confirmada.": [
    "(regular price US$600 for 12 months). Proposed capacity: initially 50 businesses, expandable to 100. The period starts at commercial launch, subject to contract and confirmed activation date.",
    "(prix habituel 600 USD pour 12 mois). Capacité envisagée : 50 entreprises au départ, extensible à 100. La période commence au lancement commercial, sous réserve du contrat et de la date d'activation confirmée.",
    "(preço normal US$600 por 12 meses). Limite proposta: 50 negócios inicialmente, ampliável a 100. O prazo começa no lançamento comercial, sujeito a contrato e confirmação da ativação.",
    "(regulärer Preis 600 USD für 12 Monate). Geplant sind zunächst 50 Unternehmen, ausbaubar auf 100. Die Laufzeit beginnt mit dem kommerziellen Start, vorbehaltlich Vertrag und bestätigtem Aktivierungsdatum.",
    "(prezzo normale 600 USD per 12 mesi). Disponibilità proposta: 50 attività inizialmente, ampliabili a 100. Il periodo decorre dal lancio commerciale, secondo contratto e data di attivazione confermata."
  ],
  "Solicita información desde el formulario de registro, seleccionando el plan mensual equivalente, hasta habilitar el contrato de fundadores.": [
    "Request information through the registration form using the corresponding monthly plan until the founding partner agreement is available.",
    "Demandez des informations dans le formulaire en choisissant l'offre mensuelle correspondante, en attendant le contrat fondateur.",
    "Solicite informações pelo formulário, escolhendo o plano mensal equivalente, até que o contrato de fundadores esteja disponível.",
    "Fordere Informationen über das Anmeldeformular mit dem entsprechenden Monatspaket an, bis der Gründungspartnervertrag verfügbar ist.",
    "Richiedi informazioni nel modulo scegliendo il piano mensile corrispondente, in attesa del contratto per i partner fondatori."
  ],
  "Registro Básico US$10 una sola vez; Destacado US$30/mes; Premium US$50/mes. Los planes mensuales incluyen el registro (no se añaden otros US$10).": [
    "Basic listing US$10 once; Featured US$30/month; Premium US$50/month. Monthly plans include registration (no additional US$10 fee).",
    "Inscription de base : 10 USD une fois ; Mise en avant : 30 USD/mois ; Premium : 50 USD/mois. Les abonnements comprennent l'inscription, sans 10 USD supplémentaires.",
    "Cadastro básico US$10 uma vez; Destaque US$30/mês; Premium US$50/mês. Os planos mensais incluem o cadastro, sem taxa extra de US$10.",
    "Basiseintrag einmalig 10 USD; Hervorgehoben 30 USD/Monat; Premium 50 USD/Monat. Monatspakete enthalten die Anmeldung, keine zusätzlichen 10 USD.",
    "Registrazione base 10 USD una tantum; In evidenza 30 USD/mese; Premium 50 USD/mese. I piani mensili includono la registrazione senza altri 10 USD."
  ]
});

// Place detail labels and the translated brand subtitle.
Object.assign(labels, {
  "A DÓNDE IR": [
    "WHERE TO GO",
    "OÙ ALLER",
    "AONDE IR",
    "WOHIN",
    "DOVE ANDARE"
  ],
  "A dónde ir": [
    "Where to go",
    "Où aller",
    "Aonde ir",
    "Wohin",
    "Dove andare"
  ],
  "Explorando lugares con fotografías": [
    "Exploring places with photos",
    "Découverte des lieux avec photos",
    "Explorando lugares com fotos",
    "Orte mit Fotos entdecken",
    "Esplorazione di luoghi con foto"
  ],
  "Ver ubicación en Where to Go": [
    "View location in Where to Go",
    "Voir l'emplacement dans Where to Go",
    "Ver localização no Where to Go",
    "Standort in Where to Go anzeigen",
    "Vedi la posizione su Where to Go"
  ],
  "Iniciar navegación": [
    "Start navigation",
    "Démarrer l'itinéraire",
    "Iniciar navegação",
    "Navigation starten",
    "Avvia navigazione"
  ],
  "Llamar": [
    "Call",
    "Appeler",
    "Ligar",
    "Anrufen",
    "Chiama"
  ],
  "Sitio web": [
    "Website",
    "Site web",
    "Site",
    "Website",
    "Sito web"
  ],
  "Guardar lugar": [
    "Save place",
    "Enregistrer ce lieu",
    "Salvar lugar",
    "Ort speichern",
    "Salva luogo"
  ],
  "Quitar favorito": [
    "Remove favorite",
    "Retirer des favoris",
    "Remover favorito",
    "Favorit entfernen",
    "Rimuovi dai preferiti"
  ],
  "Buscar foto del negocio en Google": [
    "Find business photo on Google",
    "Chercher une photo du commerce sur Google",
    "Buscar foto do negócio no Google",
    "Unternehmensfoto auf Google suchen",
    "Cerca foto dell'attività su Google"
  ],
  "Aportar foto verificada": [
    "Submit verified photo",
    "Proposer une photo vérifiée",
    "Enviar foto verificada",
    "Geprüftes Foto einreichen",
    "Invia una foto verificata"
  ],
  "Ver ficha en Google Maps": [
    "View on Google Maps",
    "Voir sur Google Maps",
    "Ver no Google Maps",
    "Auf Google Maps ansehen",
    "Vedi su Google Maps"
  ],
  "Ver detalles": [
    "View details",
    "Voir les détails",
    "Ver detalhes",
    "Details ansehen",
    "Vedi dettagli"
  ],
  "Sin fotografía del lugar": [
    "No photo of this place",
    "Aucune photo de ce lieu",
    "Sem foto deste lugar",
    "Kein Foto dieses Ortes",
    "Nessuna foto di questo luogo"
  ]
});


// Additional translated interface actions, profile status and business navigation.
Object.assign(labels, {
  "Perfil": ["Profile","Profil","Perfil","Profil","Profilo"],
  "WHERE TO GO · MI ESPACIO": [
    "WHERE TO GO · MY SPACE",
    "WHERE TO GO · MON ESPACE",
    "WHERE TO GO · MEU ESPAÇO",
    "WHERE TO GO · MEIN BEREICH",
    "WHERE TO GO · IL MIO SPAZIO"
  ],
  "Preparando tu perfil…": [
    "Preparing your profile…",
    "Préparation de votre profil…",
    "Preparando seu perfil…",
    "Dein Profil wird vorbereitet…",
    "Preparazione del tuo profilo…"
  ],
  "Guardado en este dispositivo. La sincronización entre equipos necesita activar la tabla privada de perfil en Supabase.": [
    "Saved on this device. Syncing across devices requires enabling the private profile table in Supabase.",
    "Enregistré sur cet appareil. La synchronisation nécessite d’activer la table privée des profils dans Supabase.",
    "Salvo neste dispositivo. Para sincronizar entre aparelhos, é necessário ativar a tabela privada de perfis no Supabase.",
    "Auf diesem Gerät gespeichert. Für die Synchronisierung muss die private Profiltabelle in Supabase aktiviert werden.",
    "Salvato su questo dispositivo. La sincronizzazione richiede l’attivazione della tabella privata dei profili in Supabase."
  ],
  "Modo invitado · Los datos de este perfil permanecen en este dispositivo.": [
    "Guest mode · Profile data stays on this device.",
    "Mode invité · Les données du profil restent sur cet appareil.",
    "Modo visitante · Os dados do perfil ficam neste dispositivo.",
    "Gastmodus · Die Profildaten bleiben auf diesem Gerät.",
    "Modalità ospite · I dati del profilo restano su questo dispositivo."
  ],
  "Cuenta conectada · Tu perfil de viajes se sincroniza con Supabase.": [
    "Account connected · Your travel profile syncs with Supabase.",
    "Compte connecté · Votre profil de voyage est synchronisé avec Supabase.",
    "Conta conectada · Seu perfil de viagens é sincronizado com o Supabase.",
    "Konto verbunden · Dein Reiseprofil wird mit Supabase synchronisiert.",
    "Account collegato · Il tuo profilo viaggi si sincronizza con Supabase."
  ],
  "Conectando el perfil de viajes con tu cuenta…": [
    "Connecting your travel profile to your account…",
    "Connexion de votre profil de voyage au compte…",
    "Conectando seu perfil de viagens à conta…",
    "Dein Reiseprofil wird mit deinem Konto verbunden…",
    "Collegamento del profilo viaggi al tuo account…"
  ],
  "No se pudo guardar en este dispositivo. Revisa el espacio disponible.": [
    "Could not save on this device. Check available storage.",
    "Enregistrement impossible sur cet appareil. Vérifiez l’espace disponible.",
    "Não foi possível salvar neste dispositivo. Verifique o espaço disponível.",
    "Speichern nicht möglich. Prüfe den verfügbaren Speicherplatz.",
    "Impossibile salvare su questo dispositivo. Controlla lo spazio disponibile."
  ],
  "Los favoritos y viajes que guardas explícitamente son independientes del historial automático. Los datos de los lugares de Google se almacenan únicamente mediante sus identificadores, sin copiar fichas completas.": [
    "Favorites and trips you save are separate from automatic history. Google places are stored by their identifiers only, without copying full listings.",
    "Les favoris et voyages enregistrés sont distincts de l’historique automatique. Seuls les identifiants des lieux Google sont conservés, sans copier les fiches complètes.",
    "Favoritos e viagens salvos são independentes do histórico automático. Locais do Google são guardados apenas por identificador, sem copiar fichas completas.",
    "Gespeicherte Favoriten und Reisen sind vom automatischen Verlauf getrennt. Google-Orte werden nur anhand ihrer Kennungen gespeichert, ohne vollständige Einträge zu kopieren.",
    "Preferiti e viaggi salvati sono separati dalla cronologia automatica. I luoghi Google vengono conservati solo tramite identificatori, senza copiare le schede complete."
  ],
  "Ver mis favoritos": [
    "View my favorites",
    "Voir mes favoris",
    "Ver meus favoritos",
    "Meine Favoriten ansehen",
    "Vedi i miei preferiti"
  ],
  "Mis lugares favoritos": [
    "My favorite places",
    "Mes lieux favoris",
    "Meus lugares favoritos",
    "Meine Lieblingsorte",
    "I miei luoghi preferiti"
  ],
  "Instalar Where to Go": [
    "Install Where to Go",
    "Installer Where to Go",
    "Instalar Where to Go",
    "Where to Go installieren",
    "Installa Where to Go"
  ],
  "Iniciar sesión o cambiar cuenta": [
    "Sign in or switch account",
    "Se connecter ou changer de compte",
    "Entrar ou trocar de conta",
    "Anmelden oder Konto wechseln",
    "Accedi o cambia account"
  ],
  "Reenviar confirmación de correo": [
    "Resend email confirmation",
    "Renvoyer l’e-mail de confirmation",
    "Reenviar confirmação por e-mail",
    "Bestätigungs-E-Mail erneut senden",
    "Invia di nuovo l’e-mail di conferma"
  ],
  "Cambiar contraseña por correo": [
    "Reset password by email",
    "Réinitialiser le mot de passe par e-mail",
    "Redefinir senha por e-mail",
    "Passwort per E-Mail zurücksetzen",
    "Reimposta password via e-mail"
  ],
  "Crear viaje": [
    "Create trip",
    "Créer un voyage",
    "Criar viagem",
    "Reise erstellen",
    "Crea viaggio"
  ],
  "Continuar con correo": [
    "Continue with email",
    "Continuer par e-mail",
    "Continuar com e-mail",
    "Mit E-Mail fortfahren",
    "Continua con e-mail"
  ],
  "Explorar demostración sin cuenta": [
    "Explore demo without an account",
    "Explorer la démo sans compte",
    "Explorar demonstração sem conta",
    "Demo ohne Konto erkunden",
    "Esplora la demo senza account"
  ],
  "Usar mi ubicación": [
    "Use my location",
    "Utiliser ma position",
    "Usar minha localização",
    "Meinen Standort verwenden",
    "Usa la mia posizione"
  ],
  "Usar mi ubicación actual": [
    "Use my current location",
    "Utiliser ma position actuelle",
    "Usar minha localização atual",
    "Meinen aktuellen Standort verwenden",
    "Usa la mia posizione attuale"
  ],
  "Elegir país o ciudad": [
    "Choose country or city",
    "Choisir un pays ou une ville",
    "Escolher país ou cidade",
    "Land oder Stadt auswählen",
    "Scegli paese o città"
  ],
  "Idioma / Language": [
    "Language",
    "Langue",
    "Idioma",
    "Sprache",
    "Lingua"
  ],
  "Quiero anunciarme": [
    "I want to advertise",
    "Je veux faire de la publicité",
    "Quero anunciar",
    "Ich möchte werben",
    "Voglio fare pubblicità"
  ],
  "Reintentar Google": [
    "Retry Google",
    "Réessayer Google",
    "Tentar novamente o Google",
    "Google erneut versuchen",
    "Riprova Google"
  ],
  "DESTINOS QUE INSPIRAN": [
    "INSPIRING DESTINATIONS",
    "DESTINATIONS INSPIRANTES",
    "DESTINOS INSPIRADORES",
    "INSPIRIERENDE REISEZIELE",
    "DESTINAZIONI CHE ISPIRANO"
  ],
  "DESCUBRE MÁS CERCA": [
    "DISCOVER NEARBY",
    "DÉCOUVREZ À PROXIMITÉ",
    "DESCUBRA PERTO",
    "IN DER NÄHE ENTDECKEN",
    "SCOPRI NEI DINTORNI"
  ],
  "INSPIRACIÓN PARA TU PRÓXIMO VIAJE": [
    "INSPIRATION FOR YOUR NEXT TRIP",
    "DE L’INSPIRATION POUR VOTRE PROCHAIN VOYAGE",
    "INSPIRAÇÃO PARA SUA PRÓXIMA VIAGEM",
    "INSPIRATION FÜR DEINE NÄCHSTE REISE",
    "ISPIRAZIONE PER IL TUO PROSSIMO VIAGGIO"
  ],
  "DESTINOS PARA DESCUBRIR": [
    "DESTINATIONS TO DISCOVER",
    "DESTINATIONS À DÉCOUVRIR",
    "DESTINOS PARA DESCOBRIR",
    "REISEZIELE ZUM ENTDECKEN",
    "DESTINAZIONI DA SCOPRIRE"
  ],
  "EXPLORA EL MUNDO": [
    "EXPLORE THE WORLD",
    "EXPLOREZ LE MONDE",
    "EXPLORE O MUNDO",
    "ENTDECKE DIE WELT",
    "ESPLORA IL MONDO"
  ],
  "Explorar lugares": [
    "Explore places",
    "Explorer les lieux",
    "Explorar lugares",
    "Orte erkunden",
    "Esplora luoghi"
  ],
  "Elegir municipio": [
    "Choose municipality",
    "Choisir une commune",
    "Escolher município",
    "Gemeinde auswählen",
    "Scegli comune"
  ],
  "Explorar transporte": [
    "Explore transportation",
    "Explorer les transports",
    "Explorar transporte",
    "Transportangebote entdecken",
    "Esplora i trasporti"
  ],
  "Ver más lugares": [
    "See more places",
    "Voir plus de lieux",
    "Ver mais lugares",
    "Weitere Orte anzeigen",
    "Vedi altri luoghi"
  ],
  "Promocionar negocio": [
    "Promote a business",
    "Promouvoir une entreprise",
    "Promover um negócio",
    "Unternehmen bewerben",
    "Promuovi un’attività"
  ],
  "Promocionar mi negocio": [
    "Promote my business",
    "Promouvoir mon entreprise",
    "Promover meu negócio",
    "Mein Unternehmen bewerben",
    "Promuovi la mia attività"
  ],
  "Ver en mapa": [
    "View on map",
    "Voir sur la carte",
    "Ver no mapa",
    "Auf Karte anzeigen",
    "Vedi sulla mappa"
  ],
  "Publicar mi tour o excursión": [
    "List my tour or excursion",
    "Publier mon excursion ou circuit",
    "Publicar meu passeio ou excursão",
    "Tour oder Ausflug anbieten",
    "Pubblica il mio tour o escursione"
  ],
  "Registrar mi servicio": [
    "List my service",
    "Enregistrer mon service",
    "Cadastrar meu serviço",
    "Meinen Dienst anmelden",
    "Registra il mio servizio"
  ],
  "Centrar en mí": [
    "Center on me",
    "Centrer sur ma position",
    "Centralizar em mim",
    "Auf mich zentrieren",
    "Centra sulla mia posizione"
  ],
  "Registrar mi negocio": [
    "List my business",
    "Inscrire mon entreprise",
    "Cadastrar meu negócio",
    "Mein Unternehmen eintragen",
    "Registra la mia attività"
  ],
  "Solicitar registro": [
    "Request listing",
    "Demander l’inscription",
    "Solicitar cadastro",
    "Eintrag beantragen",
    "Richiedi registrazione"
  ],
  "Elegir Destacado": [
    "Choose Featured",
    "Choisir Vedette",
    "Escolher Destaque",
    "Hervorgehoben wählen",
    "Scegli In evidenza"
  ],
  "Elegir Premium": [
    "Choose Premium",
    "Choisir Premium",
    "Escolher Premium",
    "Premium auswählen",
    "Scegli Premium"
  ],
  "Reintentar carga de municipios": [
    "Retry loading municipalities",
    "Réessayer le chargement des communes",
    "Tentar carregar municípios novamente",
    "Gemeinden erneut laden",
    "Riprova a caricare i comuni"
  ],
  "Explorar este municipio": [
    "Explore this municipality",
    "Explorer cette commune",
    "Explorar este município",
    "Diese Gemeinde erkunden",
    "Esplora questo comune"
  ],
  "Enviar para revisión": [
    "Submit for review",
    "Envoyer pour vérification",
    "Enviar para análise",
    "Zur Prüfung einreichen",
    "Invia per revisione"
  ],
  "Enviar solicitud para revisión": [
    "Submit request for review",
    "Envoyer la demande pour vérification",
    "Enviar solicitação para análise",
    "Antrag zur Prüfung senden",
    "Invia richiesta per revisione"
  ],
  "Enviar solicitud de registro": [
    "Submit registration request",
    "Envoyer une demande d’inscription",
    "Enviar solicitação de cadastro",
    "Eintragungsantrag senden",
    "Invia richiesta di registrazione"
  ],
  "Preferencias guardadas.": [
    "Preferences saved.",
    "Préférences enregistrées.",
    "Preferências salvas.",
    "Einstellungen gespeichert.",
    "Preferenze salvate."
  ],
  "Viaje guardado.": [
    "Trip saved.",
    "Voyage enregistré.",
    "Viagem salva.",
    "Reise gespeichert.",
    "Viaggio salvato."
  ],
  "Lugar agregado al viaje.": [
    "Place added to trip.",
    "Lieu ajouté au voyage.",
    "Lugar adicionado à viagem.",
    "Ort zur Reise hinzugefügt.",
    "Luogo aggiunto al viaggio."
  ],
  "Escribe el nombre del viaje.": [
    "Enter a trip name.",
    "Saisissez le nom du voyage.",
    "Digite o nome da viagem.",
    "Gib einen Reisenamen ein.",
    "Inserisci il nome del viaggio."
  ],
  "Todavía no tienes lugares aquí. Descubre lugares y guárdalos cuando quieras.": [
    "You have no places here yet. Discover and save places anytime.",
    "Vous n’avez pas encore de lieux ici. Explorez et enregistrez des lieux quand vous voulez.",
    "Você ainda não tem lugares aqui. Descubra e salve lugares quando quiser.",
    "Hier sind noch keine Orte gespeichert. Entdecke Orte und speichere sie jederzeit.",
    "Non hai ancora luoghi qui. Scopri e salva luoghi quando vuoi."
  ],
  "Foto": [
    "Photo",
    "Photo",
    "Foto",
    "Foto",
    "Foto"
  ],
  "Foto:": [
    "Photo:",
    "Photo :",
    "Foto:",
    "Foto:",
    "Foto:"
  ],
  "Detalles": [
    "Details",
    "Détails",
    "Detalhes",
    "Details",
    "Dettagli"
  ],
  "Fotografía vinculada al lugar": [
    "Photo of this place",
    "Photo liée à ce lieu",
    "Foto vinculada ao local",
    "Foto dieses Ortes",
    "Foto associata al luogo"
  ],
  "Ver detalles": [
    "View details",
    "Voir les détails",
    "Ver detalhes",
    "Details ansehen",
    "Vedi dettagli"
  ],
  "Tu próximo descubrimiento": [
    "Your next discovery",
    "Votre prochaine découverte",
    "Sua próxima descoberta",
    "Deine nächste Entdeckung",
    "La tua prossima scoperta"
  ]
});
// Premium traveler quick-menu labels, six languages.
Object.assign(labels, {
  "Accesos rápidos": [
    "Quick access",
    "Accès rapide",
    "Acesso rápido",
    "Schnellzugriff",
    "Accesso rapido"
  ],
  "Mis favoritos": [
    "My favorites",
    "Mes favoris",
    "Meus favoritos",
    "Meine Favoriten",
    "I miei preferiti"
  ]
});

// Release-readiness: newly added menus, account recovery and business UI in six languages.
Object.assign(labels,{
  "DESCUBRIR": [
    "DISCOVER",
    "DÉCOUVRIR",
    "DESCUBRIR",
    "ENTDECKEN",
    "SCOPRI"
  ],
  "MI CUENTA": [
    "MY ACCOUNT",
    "MON COMPTE",
    "MINHA CONTA",
    "MEIN KONTO",
    "IL MIO ACCOUNT"
  ],
  "INFORMACIÓN Y AYUDA": [
    "INFORMATION & HELP",
    "INFORMATIONS ET AIDE",
    "INFORMAÇÕES E AJUDA",
    "INFORMATIONEN UND HILFE",
    "INFORMAZIONI E AIUTO"
  ],
  "Ajustes e idioma": [
    "Settings and language",
    "Paramètres et langue",
    "Configurações e idioma",
    "Einstellungen und Sprache",
    "Impostazioni e lingua"
  ],
  "Mis negocios y registros": [
    "My businesses and applications",
    "Mes entreprises et demandes",
    "Meus negócios e inscrições",
    "Meine Unternehmen und Anträge",
    "Le mie attività e richieste"
  ],
  "Haz que miles de viajeros descubran tu negocio": [
    "Help thousands of travelers discover your business",
    "Faites découvrir votre entreprise à des milliers de voyageurs",
    "Faça milhares de viajantes descobrirem seu negócio",
    "Machen Sie Ihr Unternehmen für Tausende Reisende sichtbar",
    "Fai scoprire la tua attività a migliaia di viaggiatori"
  ],
  "Presenta tus servicios a quienes buscan lugares y experiencias en tu destino.": [
    "Show your services to travelers looking for places and experiences at your destination.",
    "Présentez vos services aux voyageurs qui cherchent des lieux et expériences à destination.",
    "Apresente seus serviços aos viajantes que procuram lugares e experiências no destino.",
    "Präsentieren Sie Ihre Angebote Reisenden, die Erlebnisse vor Ort suchen.",
    "Presenta i tuoi servizi ai viaggiatori in cerca di luoghi ed esperienze nella tua destinazione."
  ],
  "Iniciar sesión o registrarme": [
    "Sign in or register",
    "Se connecter ou s'inscrire",
    "Entrar ou cadastrar-se",
    "Anmelden oder registrieren",
    "Accedi o registrati"
  ],
  "Explorar lugares": [
    "Explore places",
    "Explorer les lieux",
    "Explorar lugares",
    "Orte entdecken",
    "Esplora i luoghi"
  ],
  "Promocionar mi negocio →": [
    "Promote my business →",
    "Promouvoir mon entreprise →",
    "Promover meu negócio →",
    "Mein Unternehmen bewerben →",
    "Promuovi la mia attività →"
  ],
  "Solicitar eliminación de mi cuenta": [
    "Request account deletion",
    "Demander la suppression de mon compte",
    "Solicitar exclusão da minha conta",
    "Kontolöschung beantragen",
    "Richiedi la cancellazione dell'account"
  ],
  "¿Olvidaste tu contraseña?": [
    "Forgot your password?",
    "Mot de passe oublié ?",
    "Esqueceu sua senha?",
    "Passwort vergessen?",
    "Hai dimenticato la password?"
  ],
  "Establece una contraseña nueva": [
    "Set a new password",
    "Définir un nouveau mot de passe",
    "Defina uma nova senha",
    "Neues Passwort festlegen",
    "Imposta una nuova password"
  ],
  "Has abierto un enlace de recuperación. Introduce tu nueva contraseña.": [
    "You opened a recovery link. Enter your new password.",
    "Vous avez ouvert un lien de récupération. Saisissez un nouveau mot de passe.",
    "Você abriu um link de recuperação. Digite sua nova senha.",
    "Sie haben einen Wiederherstellungslink geöffnet. Geben Sie Ihr neues Passwort ein.",
    "Hai aperto un link di recupero. Inserisci la nuova password."
  ],
  "Nueva contraseña": [
    "New password",
    "Nouveau mot de passe",
    "Nova senha",
    "Neues Passwort",
    "Nuova password"
  ],
  "Confirmar contraseña": [
    "Confirm password",
    "Confirmer le mot de passe",
    "Confirmar senha",
    "Passwort bestätigen",
    "Conferma password"
  ],
  "Guardar contraseña nueva": [
    "Save new password",
    "Enregistrer le nouveau mot de passe",
    "Salvar nova senha",
    "Neues Passwort speichern",
    "Salva la nuova password"
  ],
  "Mis solicitudes de tours": [
    "My tour applications",
    "Mes demandes d'excursions",
    "Minhas solicitações de passeios",
    "Meine Touranfragen",
    "Le mie richieste per i tour"
  ],
  "Solicitudes de tours": [
    "Tour applications",
    "Demandes d'excursions",
    "Solicitações de passeios",
    "Touranträge",
    "Richieste di tour"
  ],
  "Pendiente de revisión": [
    "Pending review",
    "En attente d'examen",
    "Pendente de análise",
    "Wird geprüft",
    "In attesa di revisione"
  ],
  "Borrador local · no enviado": [
    "Local draft · not submitted",
    "Brouillon local · non envoyé",
    "Rascunho local · não enviado",
    "Lokaler Entwurf · nicht gesendet",
    "Bozza locale · non inviata"
  ],
  "Solicita el registro de tu negocio. La recepción se confirma únicamente al guardarse en Supabase y la publicación requiere revisión y pago.": [
    "Request a listing for your business. Receipt is only confirmed when saved in Supabase; publication requires review and payment.",
    "Demandez l'inscription de votre entreprise. La réception est confirmée uniquement après sauvegarde dans Supabase ; la publication nécessite examen et paiement.",
    "Solicite o cadastro do seu negócio. O recebimento só é confirmado após salvar no Supabase; a publicação exige análise e pagamento.",
    "Beantragen Sie einen Eintrag für Ihr Unternehmen. Der Eingang gilt erst nach dem Speichern in Supabase als bestätigt; die Veröffentlichung erfordert Prüfung und Zahlung.",
    "Richiedi la registrazione della tua attività. La ricezione è confermata solo dopo il salvataggio su Supabase; la pubblicazione richiede revisione e pagamento."
  ],
  "Mis solicitudes de excursiones": [
    "My excursion requests",
    "Mes demandes d'excursions",
    "Minhas solicitações de excursões",
    "Meine Ausflugsanfragen",
    "Le mie richieste di escursioni"
  ],
  "Cuenta conectada": [
    "Account connected",
    "Compte connecté",
    "Conta conectada",
    "Konto verbunden",
    "Account connesso"
  ]
});

// Category labels are stored with stable IDs; proper names and addresses are not translated.
const categories={
rios:['Rivers','Rivières','Rios','Flüsse','Fiumi'],balnearios:['Swimming spots','Baignades naturelles','Balneários','Badestellen','Luoghi balneari'],cascadas:['Waterfalls','Cascades','Cachoeiras','Wasserfälle','Cascate'],lagunas:['Lagoons','Lagunes','Lagoas','Lagunen','Lagune'],senderismo:['Hiking','Randonnées','Trilhas','Wandern','Escursionismo'],playas:['Beaches','Plages','Praias','Strände','Spiagge'],parques:['Parks','Parcs','Parques','Parks','Parchi'],atracciones:['Tourist attractions','Sites touristiques','Atrações turísticas','Sehenswürdigkeiten','Attrazioni turistiche'],entretenimiento:['Entertainment','Divertissement','Entretenimento','Unterhaltung','Intrattenimento'],infantil:['Kids activities','Activités enfants','Diversão infantil','Kinderaktivitäten','Attività per bambini'],piscinas:['Swimming pools','Piscines','Piscinas','Pools','Piscine'],restaurantes:['Restaurants','Restaurants','Restaurantes','Restaurants','Ristoranti'],bares:['Bars','Bars','Bares','Bars','Bar'],discotecas:['Nightclubs','Discothèques','Boates','Nachtclubs','Discoteche'],cafes:['Cafés','Cafés','Cafés','Cafés','Caffetterie'],heladerias:['Ice cream shops','Glaciers','Sorveterias','Eisdielen','Gelaterie'],panaderias:['Bakeries','Boulangeries','Padarias','Bäckereien','Panetterie'],pescaderias:['Fish shops','Poissonneries','Peixarias','Fischgeschäfte','Pescherie'],comidarapida:['Fast food','Restauration rapide','Fast food','Schnellimbiss','Fast food'],supermercados:['Supermarkets','Supermarchés','Supermercados','Supermärkte','Supermercati'],colmados:['Local grocery stores','Épiceries locales','Mercearias','Nachbarschaftsläden','Alimentari'],mercados:['Markets','Marchés','Mercados','Märkte','Mercati'],tiendas:['Shops & fashion','Magasins et mode','Lojas e moda','Geschäfte & Mode','Negozi e moda'],ferreterias:['Hardware stores','Quincailleries','Lojas de ferragens','Baumärkte','Ferramenta'],electrodomesticos:['Appliances','Électroménager','Eletrodomésticos','Haushaltsgeräte','Elettrodomestici'],tecnologia:['Technology','Technologie','Tecnologia','Technik','Tecnologia'],barberias:['Barbers','Barbiers','Barbearias','Barbershops','Barbieri'],salones:['Beauty salons','Salons de beauté','Salões de beleza','Schönheitssalons','Saloni di bellezza'],unas:['Nail salons','Ongleries','Salões de unhas','Nagelstudios','Centri unghie'],spas:['Spas & massage','Spas et massages','Spas e massagens','Spas & Massagen','Spa e massaggi'],gimnasios:['Gyms','Salles de sport','Academias','Fitnessstudios','Palestre'],hoteles:['Hotels','Hôtels','Hotéis','Hotels','Hotel'],resorts:['Resorts','Resorts','Resorts','Resorts','Resort'],villas:['Villas','Villas','Villas','Villen','Ville'],taxis:['Taxis & transport','Taxis et transport','Táxis e transporte','Taxis & Transport','Taxi e trasporti'],gasolineras:['Gas stations','Stations-service','Postos de combustível','Tankstellen','Distributori'],talleres:['Repair shops','Garages','Oficinas','Werkstätten','Officine'],lavaderos:['Car washes','Stations de lavage','Lava-rápidos','Autowaschanlagen','Autolavaggi'],farmacias:['Pharmacies','Pharmacies','Farmácias','Apotheken','Farmacie'],hospitales:['Hospitals & clinics','Hôpitaux et cliniques','Hospitais e clínicas','Krankenhäuser & Kliniken','Ospedali e cliniche'],odontologia:['Dentists','Dentistes','Dentistas','Zahnärzte','Dentisti'],veterinarias:['Veterinarians','Vétérinaires','Veterinários','Tierärzte','Veterinari'],mascotas:['Pet shops','Animaleries','Pet shops','Tierhandlungen','Negozi animali'],bancos:['Banks','Banques','Bancos','Banken','Banche'],cajeros:['ATMs','Distributeurs automatiques','Caixas eletrônicos','Geldautomaten','Bancomat'],lavanderias:['Laundries','Blanchisseries','Lavanderias','Wäschereien','Lavanderie'],servicios:['Professional services','Services professionnels','Serviços profissionais','Professionelle Dienstleistungen','Servizi professionali'],escuelas:['Schools','Écoles','Escolas','Schulen','Scuole'],iglesias:['Churches','Églises','Igrejas','Kirchen','Chiese'],deportes:['Sports','Sports','Esportes','Sport','Sport']
};
const blockHeadings={
'🌿 Aventuras y naturaleza':['🌿 Adventures & nature','🌿 Aventures et nature','🌿 Aventuras e natureza','🌿 Abenteuer & Natur','🌿 Avventure e natura'],
'🍽️ Comida y bebida':['🍽️ Food & drink','🍽️ Restauration','🍽️ Comida e bebida','🍽️ Essen & Trinken','🍽️ Cibo e bevande'],
'🛍️ Compras y mercados':['🛍️ Shopping & markets','🛍️ Magasins et marchés','🛍️ Compras e mercados','🛍️ Einkaufen & Märkte','🛍️ Acquisti e mercati'],
'💆 Belleza y bienestar':['💆 Beauty & wellness','💆 Beauté et bien-être','💆 Beleza e bem-estar','💆 Beauty & Wellness','💆 Bellezza e benessere'],
'🏨 Alojamiento y transporte':['🏨 Stay & transport','🏨 Hébergement et transport','🏨 Hospedagem e transporte','🏨 Übernachtung & Verkehr','🏨 Alloggio e trasporti'],
'🩺 Salud y servicios':['🩺 Health & services','🩺 Santé et services','🩺 Saúde e serviços','🩺 Gesundheit & Dienste','🩺 Salute e servizi']
};
const originalText=new WeakMap();
const lastRenderedText=new WeakMap();
const originalAttributes=new WeakMap();
function bestLanguage(){let saved='';try{saved=localStorage.getItem('wtg_ui_language')||''}catch{}if(codes.includes(saved))return saved;const opts=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'es']);for(const raw of opts){const lang=String(raw).toLowerCase().split('-')[0];if(codes.includes(lang))return lang;}return 'es'}
let lang=bestLanguage();
function t(str){const key=String(str??'');if(lang==='es')return key;const idx=codes.indexOf(lang)-1;return (labels[key]||blockHeadings[key])?.[idx]||key;}
function category(id,fallback){const idx=codes.indexOf(lang)-1;return idx<0?fallback:(categories[id]?.[idx]||fallback);}
function dynamicText(text){
  const exp=/^(Descubre) (.+?): (tu próxima aventura\.)$/;
  // Provider names, authors and place titles stay untouched; translate only
  // the UI prefix of photo credits (not the referenced source attribution).
  if(/^Foto:\s*/.test(text))return t('Foto:')+' '+text.replace(/^Foto:\s*/,'');

  const m=text.match(exp);if(m)return t(m[1])+' '+m[2]+': '+t(m[3]);
  // Translate UI labels even when they include decorative arrows/icons.
  // The place name itself is never translated.
  const glyph=text.match(/^([✦★▤◈📷📲◎⌖🌐📍🌎🌍🧭✉♡🔐🚘+]+\s*)(.*)$/u);
  const prefix=glyph?glyph[1]:'';
  let body=glyph?glyph[2]:text;
  const end=body.match(/^(.*?)(\s*[↗→↻])$/u);
  const suffix=end?end[2]:'';
  if(end)body=end[1];
  // Translate changing result counts without translating names of places or cities.
  const template=(pattern,forms)=>{
    const match=body.match(pattern);if(!match)return null;
    return (forms[codes.indexOf(lang)]||forms[0]).replace(/\{(\d+)\}/g,(_,n)=>match[Number(n)+1]||'');
  };
  const patterns=[
    [/^(\d+) lugares con foto de (\d+) fichas · (.+?) · hasta (.+)$/,
      ['{0} lugares con foto de {1} fichas · {2} · hasta {3}',
       '{0} places with photos out of {1} listings · {2} · within {3}',
       '{0} lieux avec photos sur {1} fiches · {2} · dans un rayon de {3}',
       '{0} lugares com fotos de {1} fichas · {2} · até {3}',
       '{0} Orte mit Fotos von {1} Einträgen · {2} · bis {3}',
       '{0} luoghi con foto su {1} schede · {2} · entro {3}']],
    [/^Mostrando (\d+) de (\d+) lugares$/,
      ['Mostrando {0} de {1} lugares','Showing {0} of {1} places',
       '{0} lieux affichés sur {1}','Mostrando {0} de {1} lugares',
       '{0} von {1} Orten angezeigt','Mostrati {0} luoghi su {1}']],
    [/^(\d+) con foto en esta zona · (\d+) Google Maps · (\d+) otras fuentes$/,
      ['{0} con foto en esta zona · {1} Google Maps · {2} otras fuentes',
       '{0} with photos nearby · {1} Google Maps · {2} other sources',
       '{0} avec photos dans cette zone · {1} Google Maps · {2} autres sources',
       '{0} com fotos nesta região · {1} Google Maps · {2} outras fontes',
       '{0} mit Fotos in diesem Gebiet · {1} Google Maps · {2} andere Quellen',
       '{0} con foto in zona · {1} Google Maps · {2} altre fonti']],
    [/^(\d+) lugares para descubrir · (.+?) · hasta (.+)$/,
      ['{0} lugares para descubrir · {1} · hasta {2}',
       '{0} places to discover · {1} · within {2}',
       '{0} lieux à découvrir · {1} · rayon de {2}',
       '{0} lugares para descobrir · {1} · até {2}',
       '{0} Orte zu entdecken · {1} · bis {2}',
       '{0} luoghi da scoprire · {1} · entro {2}']],
    [/^(\d+) fotos reales$/,
      ['{0} fotos reales','{0} real photos','{0} photos authentiques',
       '{0} fotos reais','{0} echte Fotos','{0} foto reali']],
    [/^(\d+) ciudades de referencia disponibles\.$/,
      ['{0} ciudades de referencia disponibles.','{0} reference cities available.',
       '{0} villes de référence disponibles.','{0} cidades de referência disponíveis.',
       '{0} Referenzstädte verfügbar.','{0} città di riferimento disponibili.']],
    [/^Explorando (.+)$/,
      ['Explorando {0}','Exploring {0}','Exploration de {0}',
       'Explorando {0}','Erkunde {0}','Esplorando {0}']]
  ];
  for(const [pattern,forms] of patterns){
    const result=template(pattern,forms);if(result!==null)return prefix+result+suffix;
  }
  const localized=t(body);
  return prefix+localized+suffix;
}
function translateAttrs(el){
  if(!el||el.nodeType!==1||el.matches?.('script,style,[data-no-translate]'))return;
  const attrs=['placeholder','title','aria-label'];
  let records=originalAttributes.get(el);
  if(!records){records={};originalAttributes.set(el,records)}
  for(const name of attrs){
    const current=el.getAttribute?.(name);if(!current)continue;
    let record=records[name];
    if(!record||(current!==record.last&&current!==record.original))record={original:current,last:current};
    const output=dynamicText(record.original);
    if(output!==current)el.setAttribute(name,output);
    record.last=output;records[name]=record;
  }
}
function translateNode(node){
  if(!node)return;
  const process=textNode=>{
    if(textNode.parentElement?.closest('script,style,textarea,[contenteditable],.hero-coordinate,.hero-credit,.place-title,.place-meta,.detail-location,.location-pill-text,[data-no-translate]'))return;
    const text=textNode.nodeValue; if(!text||!text.trim())return;
    let source=originalText.get(textNode);
    const last=lastRenderedText.get(textNode);
    if(source===undefined || (last!==undefined && text!==last && text!==source))source=text;
    originalText.set(textNode,source);
    const raw=source.trim(),out=dynamicText(raw);
    const leading=source.match(/^\s*/)?.[0]||'';
    const trailing=source.match(/\s*$/)?.[0]||'';
    const target=leading+out+trailing;
    lastRenderedText.set(textNode,target);
    if(textNode.nodeValue!==target)textNode.nodeValue=target;
  };
  if(node.nodeType===3){process(node);return;}
  if(node.nodeType!==1&&node.nodeType!==9)return;
  const el=node.nodeType===9?node.documentElement:node;
  if(el.matches?.('script,style,textarea,[contenteditable]'))return;
  const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
  while((n=walk.nextNode()))process(n);
  translateAttrs(el);
  el.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(translateAttrs);
}
let queued=false;const pending=new Set();
function schedule(node){pending.add(node);if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const nodes=[...pending];pending.clear();nodes.forEach(translateNode);});}
function change(next,save=true){if(!codes.includes(next))next='es';lang=next;document.documentElement.lang=next;document.querySelectorAll('#wtg-language-select,#wtg-auth-language-select').forEach(el=>{el.value=next});if(save){try{localStorage.setItem('wtg_ui_language',next)}catch{}}schedule(document);window.dispatchEvent(new CustomEvent('wtg-language-changed',{detail:{language:lang}}));}
window.WTG_I18N={get lang(){return lang},t,category,change,translateDom:()=>schedule(document),supported:[...codes]};
function init(){document.documentElement.lang=lang;document.querySelectorAll('#wtg-language-select,#wtg-auth-language-select').forEach(el=>{el.value=lang;el.addEventListener('change',()=>change(el.value,true))});schedule(document);const observer=new MutationObserver(mutations=>{for(const rec of mutations){if(rec.type==='characterData')schedule(rec.target);else if(rec.type==='attributes')schedule(rec.target);else for(const node of rec.addedNodes)if(node.nodeType===1||node.nodeType===3)schedule(node);}});observer.observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title'],subtree:true});window.addEventListener('languagechange',()=>{let hasOverride=false;try{hasOverride=!!localStorage.getItem('wtg_ui_language')}catch{}if(!hasOverride)change(bestLanguage(),false);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
