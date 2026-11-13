#!/usr/bin/env python3
"""Strict photo-subject guard for a tourism app.

Camera GPS proves where a photograph was taken, NOT that the image is a
tourist destination.  Never use a space image, a mosquito, wildlife,
logos or scientific specimens as a city/place cover.
"""
import re
import unicodedata
from urllib.parse import unquote

SPACE=re.compile(
    r"\b(?:iss\d{2,3}[\s_-]*e[\s_-]*\d+|iss0\d+|view of earth|"
    r"view of the bahamas|earth from|astronaut|space station|space shuttle|"
    r"satellite|satelite|satelital|aster|landsat|sentinel|orbital|"
    r"worldview|remote sensing|nasa|metis-aist)\b",re.I)
WILDLIFE=re.compile(
    r"\b(?:mosquitos?|mosquitoes|insects?|inaturalist|lizards?|iguanas?|"
    r"anolis|cyrtopholis|arucillus|poecilia|consolea|melanerpes|"
    r"leuenbergeria|portunus|anole|geckos?|reptiles?|"
    r"spiders?|butterfl(?:y|ies)|dragonfl(?:y|ies)|moths?|"
    r"caterpillars?|beetles?|flamingos?|vultures?|pelicans?|"
    r"parrots?|frogs?|owls?|snake|snakes|ducks?|"
    r"hummingbirds?|birds?|caribbean coral|urchins?|"
    r"crabs?|snails?|fish frenzy|fauna|flora|"
    r"botanical specimens?|cact(?:us|i)|flowers?)\b",re.I)
NONTURISM=re.compile(
    r"\b(?:logos?|posters?|coat of arms|estampillas?|stamps?|"
    r"screenshots?|diagrams?|paintings?|illustrations?|"
    r"selfies?|license plates?|anti mosquito spraying|"
    r"water treatment plant|kitchenware|nissan leaf|"
    r"traffic officer|traffic control|police officers?|"
    r"primera bandera|flag of|the dominican republic flag|"
    r"bandera de republica dominicana|"
    r"autopista del coral|an officer of)\b",re.I)
DESTINATION=re.compile(
    r"\b(?:playas?|beaches?|coast|costa|bays?|bahias?|"
    r"islas?|islands?|lagunas?|lagoons?|lagos?|lakes?|"
    r"rios?|rivers?|cascadas?|waterfalls?|"
    r"hotels?|resorts?|villas?|restaurantes?|restaurants?|"
    r"cafes?|cafeterias?|marinas?|malecones?|"
    r"catedrales?|cathedrals?|iglesias?|churches?|"
    r"fortalezas?|forts?|castillos?|castles?|"
    r"monumentos?|monuments?|parques?|parks?|"
    r"plazas?|pueblos?|towns?|ciudades?|cities?|"
    r"museos?|museums?|"
    r"miradores?|viewpoints?|panoramas?|"
    r"puentes?|bridges?|centro cultural|caves?|cuevas?|"
    r"balnearios?|historic(?:al)? districts?|zona colonial|"
    r"streets?|calles?|avenidas?|"
    r"puertos?|ports?|harbours?|harbors?|"
    r"aeropuertos?|airports?|"
    r"landscape|paisaje|"
    r"colonial city)\b",re.I)
BARE_GENERIC=re.compile(r"^(?:home|img|image|dsc|pict|pic|photo|flickr|unsplash|scan)[\s_-]*\d*",re.I)

def norm(value):
    s=unquote(str(value or "")).replace("_"," ").replace("+"," ")
    return " ".join("".join(c for c in unicodedata.normalize("NFD",s.casefold())
                    if not unicodedata.combining(c)).split())

def rejection_reason(title):
    title=norm(title)
    if SPACE.search(title):return "space_satellite"
    if WILDLIFE.search(title):return "insect_wildlife"
    if NONTURISM.search(title):return "non_destination"
    return ""

def is_tourism_subject(title, locality_names=()):
    """Conservatively require an identifiable tourist destination or locality.
    The photo's *title*, not GPS search area, must identify a place.
    """
    text=norm(title)
    if rejection_reason(text) or BARE_GENERIC.match(text):return False
    if DESTINATION.search(text):return True
    for name in locality_names:
        n=norm(name)
        if len(n)>=5 and re.search(r"(?<!\w)"+re.escape(n)+r"(?!\w)",text):
            return True
    return False
