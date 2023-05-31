---
external: false
draft: true
title: "Intrduzione a Spring Framework"
description: "You can author content using the familiar markdown syntax you already know. All basic markdown syntax is supported."
date: 2022-11-02
---

## Disaccoppiamento, Dependency Injection e Inversion of Control

Uno degli obiettivi fondamentali di uno sviluppatore dovrebbe essere la scrittura di codice mantenibile. La manutenibilità della codebase è un aspetto cruciale    quando si parla di codice di qualità. Il codice dovrebbe essere flessibile e manutenibile.


La qualità di un sofware è influenzata da diversi fattori e uno di questi è la facilità con cui è possibile apportare delle modifiche al sistema. Se scriviamo codice flessibile e facile da mantenere, quando i requisiti di business cambieranno, non sarà complicato apportare le modifiche richieste.

Come sappiamo il combiamento infatti è una costante nello sviluppo software. Tutto cambia, inclusi i requisiti di business e la tecnologia.

**Tutto molto bello, ma come faccio a scrivere codice più flessibile e manutenibile ?**

### Accoppiamento

Una delle caratteristiche da tenere in considerazione nella programmazione OOP è l'**accoppiamento**.
Più alto sarà il grado di dipendenza tra le classi, più alto sarà l'accoppiamento (tight coupling). L'obiettivo dovrebbe essere quello di scrivere delle classi che non dipendano fortemente l'una dalle altre, cercando così di ridurre l'accoppiamento (loose coupling).

Vediamo ora un esempio di forte dipendenza tra due classi.

```java
class MySqlCustomerRepository {
    public int[] ages() {
        return new int[] { 21, 34, 54, 18 };
    }
}

public class CustomersCalculatorService {

    public int findOldest() {
        var repository = new MySqlCustomerRepository();

        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

In questo esempio la classe CustomersCalculatorService dipende fortemente dalla classe MySqlCustomerRepository.

Nel metodo findOldest della classe CustomerCalculatorService viene istanziata direttamente la classe MySqlCustomerRepository e questo crea un forte accoppiamento tra le classi.

Se istanziassimo la classe MySqlCustomerRepository in ogni punto del software nel quale vogliamo utilizzarla, nel caso in cui avessimo bisogno per esempio di istanziare in un modo differente la classe, oppure se volessimo sostituire il db MySql con un altro database,(per esempio un db Postgres), dovremmo andare a toccare diversi punti nella nostra codebase.

Una solizione per ridurre questo accoppiamento sarebbe quella di utilizzare la Dependency Injection.

### Dependency Injection

La **Dependency Injection** è una tecnica che ci permette di disaccoppiare la creazione di un oggetto dal suo effettivo utilizzo.
Per raggiungere questo obiettivo, l'inizializzazione dei collaboratori viene fatta all'esterno e si dice che vengono *iniettati* nei client che hanno bisgno di utilizzarli.

Questa tecnica, è inotlre in linea e viene spesso utilizzata con il principio SOLID di inversione delle dipendenze (Dependency Inversion Principle).

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 
> b. Abstractions should not depend on details. Details should depend on abstractions.
> 
>-- Robert C. Martin (Uncle Bob)

In sostanza le nostre classi devono dipendere da delle astrazioni e non dalle classi concrete.

```java
interface CustomerRepository {
    int[] ages();
}

class MySqlCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

public class CustomersCalculatorService {

    CustomerRepository repository;

    public CustomersCalculatorService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```
