## CG-DiscordBOT (Août 2019 - Novembre 2020)

Ce BOT Discord fût un BOT privé pour un serveur de cinéma que j'ai fondé avec deux amis.
Après 15 mois d'activité, nous avons décidé de fermer le serveur, la communauté étant trop innactive, et la persévérance étant devenue trop faible. Nous n'avions plus l'énergie, l'envie et le temps de maintenir ce serveur en vie. Nous aurions tout de même passé de très bons moments sur ce serveur.

**Ce Bot discord est mon premier projet avec Node.js, le BOT est destiné à un seul serveur Discord : Cinéphile Gang**

Ce bot a pour but d'offrir plusieurs fonctions dont :
- Gestions de séries et de salons dédiés aux séries proposés et votés par la communauté
- Gestion de compteurs (Membres, En ligne etc.)
- Gestion d'un Grade @MembreActif
- Envoi des publications de @netflixfr (Instagram) dans un salon spécial.

## L'organisation du code

*Le fichier principale est index.js*

**Fichiers pour gérer les séries (``seriesManager``)**

Tous les fichiers concernant la première fonction du BOT se situent dans le dossier ``seriesManager``.
On retrouve ainsi ``listener`` à qui est envoyé tous les évènements par le biais de ``index.js`` (Messages, Réactions etc.) sauf les évènements temporels (envoyés par le fichier ``cron``). Il traite les donnés et apelle des fonctions d'autres fichiers.

``addSerieAsk`` est un fichier qui s'occupe de poser les questions lorsqu'un membre veut proposer une nouvelle série.
``seriesManager`` est chargé de tout ce qui est ajout/supression de séries. Il peut appeler ``seriesMessager`` qui s'occupe d'envoyer ou de créer les embeds et les salons.
``seriesMerger`` permet de convertir différents types de donnés : il peut convertir une instance de seriesToVote en json enregistrable dans seriesToVote.json par exemple.

Les donnés des séries à voter ou des séries ajoutés sonts enregistrés dans ``seriesToVote.json`` et dans ``series.json``.
``seriesTask`` s'occupe de vérifier si les séries peuvent ou pas être transférer (si une série en cours de vote peut être acceptée ou pas et si une série déjà acceptée doit être rejetée (Appelé par ``cron``)).

Dans l'ordre :
- Ajout de série à voter
  - ``listener`` crée une instances de ``addSeriesAsk`` puis l'édite en fonctions des messages et réactions reçues (Formulaire pour proposer une série).
  - ``listener`` demande à ``seriesMerger`` de lui générer un json à partir de l'instance de ``addSeriesAsk`` (Conversion).
  - ``listener`` demande à ``seriesManager`` d'ajouter une série à voter. ``seriesManager`` enregistre le json dans ``seriesToVote.json`` et demande à ``seriesMessager`` d'envoyer le message de vote. (Création de la série à voter).

- Ajout de série à partir de séries à voter
  - ``listener`` réagis à un vote (réaction), apelle ``seriesTask`` pour lui demander de vérifier si la série peut être accepté.
  - ``seriesTask`` valide le vote, demande donc à ``seriesMerger`` de convertir les donnés json en autres donnés json (le format de ``series.json`` et de ``seriesToVote.json`` est différent) (Conversion).
  - ``seriesTask`` demande à ``seriesManager`` de supprimer la série à voter et d'ajouter la série : ``seriesManager`` sauvegarde les donnés json dans ``series.json`` et apelle ``seriesMessager`` pour envoyer le message de la série et pour créer le salon. (Création de la série)

- Supression d'une série : retour à une série à voter
  - ``cron`` apelle ``seriesTask`` (tous les jours) pour vérifier si une série est éligible à sa supression (pas assez de votes). OU Un administrateur supprime le salon ou le message de la série : ``listener`` est donc alerté et va s'occuper du traitement.
  - ``seriesTask`` ou ``listener`` va donc appeler ``seriesMerger`` puis ``seriesMessager`` pour recréer une série à voter et supprimer la série.

**Gestion des compteurs**

``index`` apelle ``counters`` lors de divers évènements (Ajout d'un utilisateur, changement de status etc.) pour que ``counters`` renome le salon en question.

**Gestion des membres actifs**

``index`` apelle ``activeMemberManager`` lorsqu'un message est envoyé pour pouvoir l'enregistrer dans ``members.json``.
Tous les jours, ``cron`` apelle ``activeMemberManager`` pour que activeMemberManager ajoute ou retire le grade @membreActif aux membres en fonction du nombre de messages envoyés les 7 derniers jours.

**Posts Instagram de @netflixfr**

``crol`` apelle ``instagram`` toutes les heures. ``instagram`` se connecte à Instagram et récupère le dernier post de @netflixfr. Si le post est nouveau, il envoie un message qui affiche ce post.

## Les APIs

J'ai utilisé uniquement des modules npm :
- Discord.js, module de base pour communiquer avec Discord
- edit-json-file pour éditer facilement les fichiers JSON
- cron pour planifier divers taches (Pour le calcul membres actifs ou les votes de séries).
- hashmap pour pouvoir enregistrer facilement toutes les instances de addSerieAsk (et pouvoir les associer à des utilisateurs) par exemple.
- instagram-private-api pour récupérer des informations sur Instagram
