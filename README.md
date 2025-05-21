# Projet-RabbitMQ
Projet final du cours de RabbitMQ

## Sommaire

- [Présentation du projet](#présentation-du-projet)
- [🎯 Objectif du projet](#-objectif-du-projet)
- [🏙️ Architecture du projet](#-architecture-du-projet)
- [💡 Technologies utilisées](#-technologies-utilisées)
- [Choix 1 : Initialisation du projet avec docker](#choix-1--initialisation-du-projet-avec-docker)
- [Choix 2 : Initialisation du projet](#choix-2--initialisation-du-projet)
- [🛠️ Utilisation](#-utilisation)
- [✨ Fonctionnalités implémentées](#-fonctionnalités-implémentées)
- [🧑‍💻 Contributeurs](#-contributeurs)

## Présentation du projet

Dans le cadre des recherches, L’institut de physique nucléaire NGI  souhaite mettre en place un système de calcul distribué capable de traiter des opérations mathématiques complexes. 
Une consultation a été lancée auprès de fournisseurs potentiels afin d’évaluer leurs compétences techniques. 
Chaque fournisseur est invité à proposer une preuve de concept sous forme d’un prototype simple permettant d’exécuter, distribuer et afficher des calculs à l’aide d’un système de files d’attente.

Ce projet repond ainsi à cette demande.

## 🎯 Objectif du projet 

L'objectif de ce projet est : 
- Distribuer des tâches de calculs (all,add, div, mul, sub) via RabbitMQ
- Traiter ces taches grâce aux workers spécialisés
- Exécuter les calculs de manière distribuée
- Récupérer et afficher les résultats dans une interface simple.

## 🏙 Architecture du projet 

Notre projet se divise en 3 types de composants : 

- Consumers : reçoivent les résultats des calculs et les transmettent à l’interface utilisateur pour affichage.
- Workers : récupèrent les tâches depuis la file et effectuent les opérations mathématiques correspondantes.
- Producer : envoie des tâches de calcul à exécuter dans une file RabbitMQ.

![alt text](./img/architecture.png)

## 💡 Technologies utilisées 

- **RabbitMQ** — Système de gestion de files de messages (AMQP)
- **Node.js** — Environnement d'exécution JavaScript côté serveur
- **amqplib** — Bibliothèque Node.js pour interagir avec RabbitMQ
- Websocket
- Express

## Choix 1 : Initialisation du projet avec docker
``` cmd 
cd  projet-rabbitmq
docker build ./
docker compose -f Docker/docker-compose.yml up --build
```

## Choix 2 : Initialisation du projet
```cmd
cd projet-rabbitmq
npm i 
```

### Configuration 

Créez un fichier `.env` à la racine du projet avec vos informations de connexion à RabbitMQ et un mot de passe afin de pouvoir lancer les commandes dans le terminal :

```cmd
RABBITMQ_URL=amqp://exemple:exemple@hotsname.vhost:port
```
_Vous pouvez prendre exemple sur `.env.example`_

### Avec le frontend 
_Afin d'utiliser le frontend, nous allons laisser de côté le `producer.js` nous allons à la place utiliser `api.js`._

Lancer l'api : 
```cmd
cd src
node api.js
```
### Sans frontend

Lancer le producer : 
```cmd
cd src
cd producers
node producer.js
```

_Après avoir choisi une des deux options, poursuivre les étapes suivantes._ 

### Lancer les workers  (le refaire pour chaque worker : add, div, sub, mul, all) :

Aller dans le dossier worker 
```cmd
cd src 
cd workers
node add.js
```
Lancer chaque worker :

- [x] Addition (add) node add.js
- [x] Soustraction (sub) node sub.js,
- [x] Division (div) node div.js,
- [x] Multiplication (mul) node mul.js,
- [x] Tous les workers (all) node all.js,

### Lancer le consumer : 
```cmd
cd src
cd consumers
node consumer.js
```

### Affichage sur le navigateur :
Accéder à l’affichage des résultats, aller sur l’url suivante :
http://localhost:3000/

![alt text](./img/screen_front.png)

## 🛠 Utilisation

Une fois le système en place et tous les composants démarrés :

### Sans frontend

- Le producer va automatiquement générer des requêtes de calcul et les envoyer aux workers appropriés.
- Les workers vont traiter les calculs (avec un délai aléatoire de 5 à 15 secondes pour simuler un calcul complexe).
- Le consumer va afficher les résultats des calculs au fur et à mesure qu'ils sont disponibles.

Pour arrêter chaque composant, utilisez Ctrl+C dans le terminal correspondant.

### Avec frontend

- L'utilisateur renseigne 2 nombres, un type d'opération 
- Il lance le calcul
- Les workers vont traiter les calculs (avec un délai aléatoire de 5 à 15 secondes pour simuler un calcul complexe).
- Le consumer va envoyer les résultats des calculs au frontend via un websocket.
- Les résultats sont affichés.

Pour arrêter chaque composant, utilisez Ctrl+C dans le terminal correspondant.

## ✨ Fonctionnalités implémentées

### Fonctionnalités de base

✅ Génération automatique d'opérandes et envoi de requêtes
✅ Traitement des calculs par les workers avec simulation de délai
✅ Affichage des résultats par le consumer

### Améliorations du projet 1

✅ Spécialisation des workers par type d'opération (add, sub, mul, div)
✅ Génération aléatoire du type d'opération

### Améliorations du projet 2

✅ Support de l'opération "all" envoyant la même requête à tous les workers
✅ Génération aléatoire incluant l'opération "all"

### Autres améliorations

✅ Indexation des opérations pour un suivi plus facile
✅ Affichage du formulaire de calcul
✅ Affichage du résultat de l'opération

## 🧑‍💻 Contributeurs
- MANCEAU Arthur
- BESROUR Rayane
- KTOURZA Noemie
- LE FORMAL Guillaume
