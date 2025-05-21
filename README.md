## Route pour lancer le projet

Initialisation du projet à la racine :  

```js
npm i
```

lancer le producer : 

```js
cd src
cd producers
node producer.js add 25 34
```

Lancer les workers  (le refaire pour chaque worker : add, div, sub, mul, all)

```js
cd src 
cd workers
node add.js
```

Lancer le consumer : 

```js
cd src
cd consumers
node consumer.js
```

Accéder à l’affichage des résultats, aller sur l’url suivant :
```js
http://localhost:3000/
```
