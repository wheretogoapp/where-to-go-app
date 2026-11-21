/* Where to Go | Prefer device/browser locale; allow a visitor override.
   No machine translation API, no credentials, no cookies. Proper names stay original.
   Supported UI locales: es, en, fr, pt, de, it. Others safely fall back to es. */
(function(){
'use strict';
const codes=['es','en','fr','pt','de','it'];
const labels={
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
  "Google, Facebook, Apple y correo requieren conectar Supabase y habilitar cada proveedor.": [
    "Google, Facebook, Apple and email sign-in require a configured Supabase connection.",
    "La connexion via Google, Facebook, Apple ou e-mail nécessite une configuration Supabase.",
    "O login com Google, Facebook, Apple ou e-mail requer uma conexão Supabase configurada.",
    "Google-, Facebook-, Apple- und E-Mail-Anmeldung erfordern eine Supabase-Konfiguration.",
    "L'accesso con Google, Facebook, Apple ed email richiede la configurazione di Supabase."
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
  "Google Places está temporalmente fuera de servicio": [
    "Google Places is temporarily unavailable",
    "Google Places est temporairement indisponible",
    "O Google Places está temporariamente indisponível",
    "Google Places ist vorübergehend nicht verfügbar",
    "Google Places è temporaneamente non disponibile"
  ],
  "La búsqueda continúa con datos reales de OpenStreetMap.": [
    "Search continues using real OpenStreetMap data.",
    "La recherche continue avec les données réelles d’OpenStreetMap.",
    "A busca continua com dados reais do OpenStreetMap.",
    "Die Suche nutzt weiterhin echte OpenStreetMap-Daten.",
    "La ricerca continua con dati reali di OpenStreetMap."
  ],
  "Reintentar Google": [
    "Retry Google",
    "Réessayer Google",
    "Tentar Google novamente",
    "Google erneut versuchen",
    "Riprova Google"
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
  "Las solicitudes se envían a Netlify Forms para revisión humana y coordinación del pago, si el formulario está activado en Netlify. Este panel conserva una copia local; las solicitudes no se publican ni se cobran automáticamente.": [
    "Requests are sent to Netlify Forms for manual review and payment coordination, when enabled. This panel keeps a local copy; requests are not published or charged automatically.",
    "Les demandes sont transmises à Netlify Forms pour vérification manuelle et coordination du paiement, si activé. Ce panneau conserve une copie locale ; aucune publication ni facturation automatique.",
    "As solicitações vão para Netlify Forms para revisão e coordenação do pagamento, quando ativado. Este painel mantém uma cópia local; não há publicação nem cobrança automática.",
    "Anfragen gehen bei aktivem Formular zur manuellen Prüfung und Zahlungsabstimmung an Netlify Forms. Dieses Panel speichert eine lokale Kopie; keine automatische Veröffentlichung oder Abbuchung.",
    "Le richieste vengono inviate a Netlify Forms per la revisione e la gestione del pagamento, se abilitato. Questo pannello conserva una copia locale; nessuna pubblicazione o addebito automatico."
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
  const m=text.match(exp);if(m)return t(m[1])+' '+m[2]+': '+t(m[3]);
  // Translate UI labels even when they include decorative arrows/icons.
  // The place name itself is never translated.
  const glyph=text.match(/^([✦★▤◈📷◎⌖🌐]+\s*)(.*)$/u);
  const prefix=glyph?glyph[1]:'';
  let body=glyph?glyph[2]:text;
  const end=body.match(/^(.*?)(\s*[↗→↻])$/u);
  const suffix=end?end[2]:'';
  if(end)body=end[1];
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
    if(textNode.parentElement?.closest('script,style,textarea,[contenteditable],.hero-coordinate,.hero-credit,.place-title,.place-meta,.detail-location,.detail-description,.source-credit,.photo-authors,.location-pill-text,[data-no-translate]'))return;
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
function init(){document.documentElement.lang=lang;document.querySelectorAll('#wtg-language-select,#wtg-auth-language-select').forEach(el=>{el.value=lang;el.addEventListener('change',()=>change(el.value,true))});schedule(document);const observer=new MutationObserver(mutations=>{for(const rec of mutations){for(const node of rec.addedNodes)if(node.nodeType===1||node.nodeType===3)schedule(node);}});observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('languagechange',()=>{let hasOverride=false;try{hasOverride=!!localStorage.getItem('wtg_ui_language')}catch{}if(!hasOverride)change(bestLanguage(),false);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
