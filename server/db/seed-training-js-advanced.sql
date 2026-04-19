-- ==========================================
-- DYG Training — JavaScript Avancé (You Don't Know JS)
-- 3 tracks Expert (Low / Mid / High), 9 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('cc100000-0000-0000-0000-000000000001', 'JS Expert Low — Scope & Closures', 'Hoisting, scope chain, closures en profondeur, IIFE, modules. Tu crois connaître les closures ? Prouve-le.', 4, 19),
('cc200000-0000-0000-0000-000000000001', 'JS Expert Mid — this, Prototypes & Coercion', 'Les 4 règles du this, prototype chain, coercion implicite. Le JS que personne ne comprend vraiment.', 5, 20),
('cc300000-0000-0000-0000-000000000001', 'JS Expert High — Event Loop & Metaprogramming', 'Microtasks, macrotasks, Proxy, Reflect, Symbol, generators, iterators. Le boss final JavaScript.', 6, 21);

-- ==========================================
-- EXPERT LOW: Scope & Closures
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cd110000-0000-0000-0000-000000000001', 'cc100000-0000-0000-0000-000000000001',
 'Hoisting et Temporal Dead Zone',
 'Comprends pourquoi var se comporte différemment de let/const.',
 'Crée un fichier qui démontre chaque piège :

1. **Var hoisting** : appelle une variable var AVANT sa déclaration → affiche undefined (pas d''erreur)
2. **Function hoisting** : appelle une fonction AVANT sa déclaration → fonctionne (les déclarations de fonction sont hoistées)
3. **Let/const TDZ** : accède à un let avant sa déclaration → ReferenceError. Explique pourquoi en commentaire.
4. **Function expression** : const fn = function() {} — pas hoistée. Appelle avant → TypeError
5. **Piège** : dans un for(var i=0; i<5; i++) { setTimeout(() => console.log(i), 100) } → affiche 5 cinq fois. Explique pourquoi.
6. **Fix** : corrige le piège avec let, ou avec une IIFE, ou avec bind. Les 3 solutions.

Chaque exemple doit avoir un commentaire qui explique le POURQUOI, pas juste le résultat.',
 'Les 3 fixes du piège setTimeout fonctionnent. Chaque commentaire explique le mécanisme sous-jacent.',
 4, 1, '{"code","craft","autonomy"}'),

('cd120000-0000-0000-0000-000000000001', 'cc100000-0000-0000-0000-000000000001',
 'Closures : au-delà des bases',
 'Les closures ne sont pas juste des fonctions dans des fonctions.',
 'Crée ces programmes qui utilisent des closures avancées :

1. **Compteur privé** : crée un module counter avec increment(), decrement(), reset(), getValue() — la valeur est inaccessible de l''extérieur
2. **Memoize** : crée une fonction memoize(fn) qui cache les résultats. memoize(fibonacci)(40) → instantané la 2ème fois
3. **Currying** : crée curry(fn) qui transforme add(a, b, c) en add(1)(2)(3). Fonctionne avec un nombre variable d''arguments.
4. **Partial application** : crée partial(fn, ...args) — partial(add, 1)(2, 3) → 6
5. **Once** : crée once(fn) qui ne s''exécute qu''une seule fois, retourne le même résultat ensuite
6. **Exercice** : crée un système de middleware (comme Express) avec des closures : use(fn) ajoute un middleware, run(data) les exécute dans l''ordre',
 'Memoize accélère fibonacci de 100x. Curry fonctionne avec 2, 3 et 4 arguments. Le middleware chain fonctionne.',
 4, 2, '{"code","craft","creativity","autonomy"}'),

('cd130000-0000-0000-0000-000000000001', 'cc100000-0000-0000-0000-000000000001',
 'Module Pattern et encapsulation',
 'IIFE, revealing module pattern, ES modules. L''encapsulation en JS.',
 'Crée un système modulaire complet :

1. **IIFE module** : const MyLib = (function() { let private = 0; return { get: () => private, set: (v) => private = v }; })()
2. **Revealing module** : expose uniquement ce qui doit être public. 5 méthodes privées, 3 publiques.
3. **ES modules** : refactore en import/export. Un module principal qui importe 3 sous-modules.
4. **Singleton** : crée un singleton (instance unique) avec un module
5. **Factory** : crée une factory function qui utilise des closures pour cacher l''état
6. **Exercice** : crée un mini-framework de validation avec modules : validators.js (email, phone, required), sanitizers.js (trim, lowercase, escape), et form.js qui les combine',
 'Le framework de validation est modulaire. Chaque module a un état privé. Les imports sont propres.',
 4, 3, '{"code","craft","autonomy"}');

-- ==========================================
-- EXPERT MID: this, Prototypes & Coercion
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cd210000-0000-0000-0000-000000000001', 'cc200000-0000-0000-0000-000000000001',
 'Les 4 règles du this',
 'Default binding, implicit, explicit (call/apply/bind), new. Maîtrise le this.',
 'Crée des exemples qui démontrent chaque règle :

1. **Default binding** : function show() { console.log(this) } → window en non-strict, undefined en strict
2. **Implicit binding** : obj.method() → this = obj. Mais const fn = obj.method; fn() → this perdu. Pourquoi ?
3. **Explicit binding** : fn.call(obj), fn.apply(obj, [args]), const bound = fn.bind(obj)
4. **new binding** : function Person(name) { this.name = name } — new crée un nouvel objet
5. **Priorité** : new > bind > call/apply > implicit > default. Prouve-le avec des exemples.
6. **Arrow functions** : les arrows n''ont PAS de this propre. Elles héritent du scope parent. Démontre avec un exemple dans un objet.
7. **Exercice** : crée une fonction qui log le this de 5 façons différentes et prédis le résultat AVANT d''exécuter',
 'Chaque règle est démontrée. Les prédictions sont correctes. La priorité est prouvée par l''exemple.',
 5, 1, '{"code","craft","autonomy"}'),

('cd220000-0000-0000-0000-000000000001', 'cc200000-0000-0000-0000-000000000001',
 'Prototypes et chaîne prototypale',
 '__proto__, Object.create, prototype chain. Comment JS fait vraiment l''héritage.',
 'Crée ces démonstrations :

1. **__proto__** : crée un objet animal = { eat() {} }. Crée rabbit = { jump() {} }. rabbit.__proto__ = animal. rabbit peut maintenant eat() ET jump().
2. **Object.create** : const rabbit = Object.create(animal) — plus propre que __proto__
3. **Chaîne** : rabbit → animal → Object.prototype → null. Affiche chaque maillon avec Object.getPrototypeOf()
4. **Shadowing** : rabbit.eat = function() { ... } — shadow la méthode du parent. Prouve que animal.eat n''est pas modifié.
5. **Constructor** : function Animal(name) { this.name = name }. Animal.prototype.eat = function() {}. new Animal("Cat").eat() fonctionne. Explique POURQUOI.
6. **Exercice** : implémente un système d''héritage SANS le mot-clé class. Animal → Dog → GuideDog. Chaque niveau ajoute des méthodes.',
 'L''héritage fonctionne sans class. La chaîne prototypale est comprise. Le shadowing est démontré.',
 5, 2, '{"code","craft","autonomy"}'),

('cd230000-0000-0000-0000-000000000001', 'cc200000-0000-0000-0000-000000000001',
 'Coercion : le type system de JS',
 'Coercion implicite et explicite. == vs ===. Les pièges de JS.',
 'Crée un fichier "JS WTF explained" :

1. **ToString** : String(null) → "null", String(undefined) → "undefined", String([1,2]) → "1,2"
2. **ToNumber** : Number("") → 0, Number(true) → 1, Number(null) → 0, Number(undefined) → NaN
3. **ToBoolean** : les 7 valeurs falsy : false, 0, -0, "", null, undefined, NaN. TOUT le reste est truthy (même "0", [], {})
4. **== vs ===** : "1" == 1 → true (coercion). "1" === 1 → false (pas de coercion). Explique l''algorithme.
5. **Pièges** : [] == false → true. [] == ![] → true. Explique CHAQUE étape de la coercion.
6. **Exercice** : crée une fonction safeEqual(a, b) qui compare de manière sûre en gérant tous les edge cases (NaN, null, undefined, 0/-0)',
 'Chaque piège est expliqué étape par étape. safeEqual gère NaN === NaN (vrai) et 0 === -0 (faux).',
 5, 3, '{"code","craft","autonomy"}');

-- ==========================================
-- EXPERT HIGH: Event Loop & Metaprogramming
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cd310000-0000-0000-0000-000000000001', 'cc300000-0000-0000-0000-000000000001',
 'Event Loop : microtasks vs macrotasks',
 'setTimeout, Promise, queueMicrotask, requestAnimationFrame. L''ordre d''exécution.',
 'Crée ces puzzles et prédis l''ordre d''exécution AVANT de lancer :

1. **Puzzle 1** : console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D"); → A, D, C, B
2. **Puzzle 2** : imbrique 3 niveaux de setTimeout + Promise + queueMicrotask. Prédis l''ordre.
3. **Explication** : dessine le cycle event loop (call stack → microtask queue → macrotask queue) en commentaires
4. **requestAnimationFrame** : montre qu''il s''exécute avant le repaint mais après les microtasks
5. **Starvation** : montre comment une boucle infinie de microtasks bloque les macrotasks
6. **Exercice** : crée une fonction scheduleWork(tasks) qui distribue un tableau de tâches lourdes sur plusieurs frames (requestAnimationFrame) sans bloquer l''UI',
 'Tous les ordres d''exécution sont prédits correctement. scheduleWork ne bloque pas l''UI.',
 6, 1, '{"code","craft","autonomy"}'),

('cd320000-0000-0000-0000-000000000001', 'cc300000-0000-0000-0000-000000000001',
 'Generators et Iterators',
 'function*, yield, Symbol.iterator, for...of. Le lazy evaluation en JS.',
 'Crée ces programmes :

1. **Generator basique** : function* count() { yield 1; yield 2; yield 3; } — itère avec .next()
2. **Infini** : function* fibonacci() — génère la suite de fibonacci à l''infini (lazy)
3. **Bidirectionnel** : gen.next(value) — envoie une valeur DANS le generator via yield
4. **Iterable custom** : crée un objet Range(start, end) avec [Symbol.iterator] qui permet for(const n of new Range(1, 10))
5. **Async generator** : async function* fetchPages(url) — fetch page par page avec yield
6. **Exercice** : crée un système de pipeline paresseux : lazy([1,2,3,4,5]).map(x => x*2).filter(x => x > 4).take(2).toArray() — rien ne s''exécute avant toArray()',
 'Le pipeline paresseux fonctionne. Fibonacci infini ne crash pas. L''iterable custom marche dans for...of.',
 6, 2, '{"code","craft","creativity","autonomy"}'),

('cd330000-0000-0000-0000-000000000001', 'cc300000-0000-0000-0000-000000000001',
 'Proxy, Reflect et Metaprogramming',
 'Proxy, Reflect, Symbol, WeakRef. Programme ton langage.',
 'Crée ces systèmes avec le metaprogramming JS :

1. **Observable** : crée un Proxy qui déclenche des callbacks quand une propriété change : const state = observable({ count: 0 }); watch(state, "count", (old, new) => ...)
2. **Validation** : crée un Proxy qui valide les types à l''écriture : const user = typed({ name: String, age: Number }); user.name = 42 → TypeError
3. **Negative indexing** : crée un Proxy sur un Array qui permet arr[-1] (dernier élément) comme en Python
4. **Auto-vivification** : crée un Proxy qui crée automatiquement les objets imbriqués : obj.a.b.c.d = 42 → fonctionne même si a, b, c n''existent pas
5. **Revocable** : Proxy.revocable — crée un accès temporaire qui peut être révoqué
6. **Exercice** : crée un mini-ORM : const User = model("users", { name: String, email: String, age: Number }); const u = User.create({ name: "Alice" }); u.name → "Alice"; u.save() → simule une sauvegarde',
 'L''observable notifie les watchers. Le typed proxy valide les types. Le mini-ORM fonctionne.',
 6, 3, '{"code","craft","creativity","autonomy","versatility"}');
