---
external: false
draft: false
title: "Ridurre l'accoppiamento nel codice con la Dependency Injection"
description: "Introduzione ai concetti principali di Spring Framework come Dependency Injection e Depenency Inversion Principle."
date: 2023-06-07
---

## Introduzione

> "C'è stato un cambio nei requisiti di business e dovremmo apportare questa piccola modifica"

 *Quante volte ti è capitato di sentire una frase simile? Quanto tempo ci hai impiegato per apportare quella piccola modifica?*

 Nello sviluppo software, tutto cambia, i requisiti di business cambiano, la tecnologia evolve e le persone che lavorano su un progetto cambiano nel tempo, il cambiamento è inevitabile.    
 Per questo motivo, uno degli obiettivi di ogni sviluppatore dovrebbe essere quello di scrivere codice che risponda bene al cambiamento, un aspetto cruciale quando si parla di qualità.

Tutto molto bello, ma come faccio a scrivere codice che sia più flessibile e manutenibile?

## Indice
- [Accoppiamento](#accoppiamento)
- [Dependency Injection](#dependency-injection)
  - [Constructor injection](#constructor-injection)
  - [Setter injection](#setter-injection)
  - [Interface injection](#interface-injection)
- [Dependency Inversion Principle](#dependency-inversion-principle)
- [Conclusione](#conclusione)

## Accoppiamento

Una delle caratteristiche da tenere in considerazione nella programmazione è l'**accoppiamento**.
Più alto sarà il grado di dipendenza tra le classi, più alto sarà l'accoppiamento (*tight coupling*).     
L'obiettivo dovrebbe essere quello di scrivere delle classi che non dipendano fortemente l'una dalle altre, cercando così di ridurre l'accoppiamento (*loose coupling*).

*Si dice che c'è una **dipendenza** tra due classi **quando una classe A utilizza** o dipende da **una classe B** per eseguire determinate operazioni.*

Vediamo un esempio di forte dipendenza tra due classi.
```java
class CustomerRepositoryMySql {
    public int[] ages() {
        return new int[] { 21, 34, 54, 18 };
    }
}

class CustomersService {

    CustomerRepositoryMySql repository;

    public CustomersService() {
        //Istanziamo direttamente la classe CustomerRepositoryMySql
        this.repository = new CustomerRepositoryMySql();
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

In questo esempio la classe *CustomersService* dipende fortemente dalla classe *CustomerRepositoryMySql*.

La classe *CustomerRepositoryMySql* viene istanziata direttamente nel costruttore di *CustomersService* e questo crea un forte accoppiamento tra le due classi.

Se questo approccio venisse utilizzato in tutta la nostra codebase e per esempio, volessimo sostituire il tipo di database con un DB Postgres, dovremmo andare a modificare diversi punti della nostra applicazione.

Una soluzione per ridurre questo accoppiamento è l'utilizzo della *Dependency Injection*.

## Dependency Injection

La **Dependency Injection** è una tecnica che ci permette di disaccoppiare la creazione di un oggetto dal suo effettivo utilizzo.   
Per raggiungere questo obiettivo, l'inizializzazione dei collaboratori viene fatta all'esterno e si dice che vengono *iniettati* come dipendenze nei client che hanno bisogno di utilizzarli.

Esistono 3 tipi di dependency injection:
1. Constructor injection
1. Setter injection
2. Interface injection

Vediamo come applicarli alla classe CustomersService.
### Constructor injection
In questo tipo di dependency injection la dipendenza viene passata come parametro al costruttore.    
Utilizzare questa tecnica ci assicura che il client sia sempre in uno stato valito in quanto non potrà essere inizializzato senza le sue dipendenze.

```java
class CustomersService {

    CustomerRepositoryMySql repository;

    //Passiamo la dipendenza come parametro del costruttore
    public CustomersService(CustomerRepositoryMySql repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```


### Setter injection
La classe client espone un metodo setter utilizzato per iniettare la dipendenza. Dal momento in cui il client viene inizializzato la sua dipendenza può essere iniettata in qualsiasi momento.  Questa tecnica ci permette di cambiare la dipendenza utilizzata a runtime, ma non ci assiucura che il client sia sempre in uno stato valido. (Questo ci esporrebbe a una possibile NullPointerException)
```java
class CustomersService {

    private CustomerRepositoryMySql repository;

    //Utilizziamo un setter per iniettare la dipendenza
    public void setRepository(CustomerRepositoryMySql repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

### Interface injection
Simile alla setter injection, in questo caso, la classe client implementa un interfaccia che definisce un metodo che sarà utilizzato per iniettare la dipendenza. Anche questa tecnica ci può offrire una certa flessibilà, ma non assicura che il client sia sempre in uno stato valido.

```java
interface RepositorySetter {
    public void inject(CustomerRepositoryMySql service);
}

class CustomersService implements RepositorySetter {

    private CustomerRepositoryMySql repository;
    
    //Utilizziamo il metodo definito nell'interfaccia implementata
    public void inject(CustomerRepositoryMySql repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

### Quali vantaggi porta la dependency injection:

- **Riutilizzo del codice:**        
    Come abbiamo detto la DI ci permette di ridurre l'accoppiamento e questo favorisce anche la separazione delle responsabilità delle nostre classi. Ciò facilita la creazione di moduli indipendenti e riutilizzabili.

- **Aumento della testabilità**:        
    Uno dei benefici principali della DI lo troviamo negli gli unit test.    
    
    L'utilizzo della dependency injection durante l'esecuzione dei test ci permette di sostituire le dipendenze reali, con dei "test double", come i mock o gli stub.        
    I "test double" ci consentono di simulare il comportamento delle dipendenze della classe che vogliamo testare, quindi siamo in grado di testare come la classe reagisce quando una dipendenza ritorna valori specifici o genera eccezioni. 

    Se per esempio, la classe sotto test ha come dipendenza un repository che effettua delle richieste ad un database, possiamo sostituirla, iniettando un "mock" in modo da simularne il comportamento senza dover effettivamente connetterci a un DB reale.

- **Aumento della flessibilità** 
    La dependency injection ci permette di rendere il nostro codice più flessibile. La delegazione dell'inizializzazione delle dipendenze all'esterno rende i client che le utilizzano configurabili, anche a runtime. Questo significa che è possibile cambiare le dipendenze di una classe senza modificare il codice sorgente.


La DI, viene spesso utilizzata assieme al principio SOLID di inversione delle dipendenze *(Dependency Inversion Principle)*.

## Dependency Inversion Principle

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 
> b. Abstractions should not depend on details. Details should depend on abstractions.
> 
>-- Robert C. Martin (Uncle Bob)

In sostanza secondo questo principio le nostre classi dovrebbero dipendere da delle astrazioni e non dalle classi concrete.

Negli esempi fatti fin ora la classe CustomersService non sta rispettando questo principio in quanto dipende dalla classe concreta del repository.

Vediamo come possiamo ridurre ulteriormente l'accoppiamento utilizzando un astrazione della classe CustomerRepositoryMySql:
```java
//Aggiungiamo l'interfaccia CustomerRepository
interface CustomerRepository {
    int[] ages();
}

//Implementiamo l'interfaccia che abbiamo creato
class CustomerRepositoryMySql implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

class CustomersService {

    CustomerRepository repository;

    //Utilizziamo l'interfaccia come parametro del costruttore
    public CustomersService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Quello che abbiamo fatto è stato introdurre l'interfaccia *CustomerRepository*, che viene implementata da *CustomerRepositoryMySql* ed invece di utilizzare la classe concreta come parametro del costruttore del servizio utilizziamo l'interfaccia.

Adesso il servizio non dipenderà più dalla classe concreta, ma dalla sua interfaccia.

Che vantaggi ci porta l'utilizzo di questo approccio ?

Adesso possiamo iniettare come dipendenza qualsiasi classe che implementa l'interfaccia CustomerRepository.         

Se dovessimo, per esempio, sostituire il tipo di database, quello che faremo sarà introdurre una nuova classe che implementa l'interfaccia corretta, permettendoci di lavorare per estensione piuttosto che per modifica.

Vediamolo nel concreto:
```java
interface CustomerRepository {
    int[] ages();
}

class CustomerRepositoryMySql implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

//Creiamo una nuova classe che implementa l'interfaccia CustomerRepository
class CustomerRepositoryDynamoDb implements CustomerRepository {
    public int[] ages() {
        return new int[]{101, 304, 504, 188};
    }
}

class CustomersService {

    CustomerRepository repository;

    public CustomersService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Abbiamo creato le nuova classe *CustomerRepositoryDynamoDb* che implementa l'interfaccia *CustomerRepository* in modo da poterla iniettare nel servizio.   

L'unica modifica necessaria per utilizzare la nuova classe, sarà modificare l'istanza iniettata nel costruttore.

Il compito di configurare le dipendenze e inizializzarle decidendo quali iniettare sarà affidato ad un componente esterno, comportamento alla base dell'Inversion of Control (IoC).         

Come hai potuto intuire la Dependency Injection ci offre tanti vantaggi, ma stiamo aggiungendo un livello di complessità che è quello della configurazione.

Bisogna infatti stare attenti ad iniettare sempre le dipendenze corrette nel punto e al momento giusto.

Per aiutarci in questo ci sono diversi framework che possiamo utilizzare.       
       
In Java il più famoso e ampiamente utilizzato è il framework **Spring**, che basa il suo funzionamento proprio sulla Dependency Injection e sull'Inversion of Control, ma ne esistono diversi, come Guice o Dagger.

## Conclusione

Se sei arrivato fin qui, complimenti! Hai letto il mio primissimo blog post.

Attraverso questo post abbiamo scoperto cos'è l'accoppiamento tra le classi e come possiamo ridurlo utilizzando la dependency injection, capendo anche quali sono alcuni dei suoi vantaggi, come la separazione delle responsabilità, l'aumento della flessibilità e della testabilità

Inoltre abbiamo visto come la DI è utilizzata assieme al principio di inversione delle dipendenze in modo da aumentare ulteriormente disaccoppiamento e flessibilità utilizzando le interfacce.

Adesso tocca a te! Inizia a esplorare l'utilizzo della Dependency Injection nel tuo progetto e identifica le classi che possono beneficiare di una maggiore flessibilità e modularità grazie a queste tecnica. Buon lavoro!