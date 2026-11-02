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
  if(el.tagName==='INPUT'&&el.placeholder){const out=t(el.placeholder);if(out!==el.placeholder)el.placeholder=out;}
  el.querySelectorAll?.('input[placeholder]').forEach(x=>{const out=t(x.placeholder);if(out!==x.placeholder)x.placeholder=out;});
}
let queued=false;const pending=new Set();
function schedule(node){pending.add(node);if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const nodes=[...pending];pending.clear();nodes.forEach(translateNode);});}
function change(next,save=true){if(!codes.includes(next))next='es';lang=next;document.documentElement.lang=next;document.querySelectorAll('#wtg-language-select,#wtg-auth-language-select').forEach(el=>{el.value=next});if(save){try{localStorage.setItem('wtg_ui_language',next)}catch{}}schedule(document);window.dispatchEvent(new CustomEvent('wtg-language-changed',{detail:{language:lang}}));}
window.WTG_I18N={get lang(){return lang},t,category,change,translateDom:()=>schedule(document),supported:[...codes]};
function init(){document.documentElement.lang=lang;document.querySelectorAll('#wtg-language-select,#wtg-auth-language-select').forEach(el=>{el.value=lang;el.addEventListener('change',()=>change(el.value,true))});schedule(document);const observer=new MutationObserver(mutations=>{for(const rec of mutations){for(const node of rec.addedNodes)if(node.nodeType===1||node.nodeType===3)schedule(node);}});observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('languagechange',()=>{let hasOverride=false;try{hasOverride=!!localStorage.getItem('wtg_ui_language')}catch{}if(!hasOverride)change(bestLanguage(),false);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
