# My Driving API 

## Design 

### Database 

Having a truly horizontal scalable database is not for faint hearted. A number of databases were considered. 

- Dynamodb
   
The chosen db for this project. Provided by AWS, Dyanmodb should be well-supported, well-maintained, battle-tested and reliable among the others. On the paper, Dynamodb is designed to be highly scalable and no need to brother with configuration on user side. The only downside is cost.
  
- Redis Cluster 

Redis cluster flavors availability rather than consistence. Without consistency, each worker may see different version of data and if colaborating among instances may need in the future, it would be hard to implement on top of it (though not implemented in currently). Also, there seems no automatical way to dynamically add a dockersized redis to Redis cluster. 
  
- Hyperdex 

Look very good on paper, choose consistence and availability, easy to manage. The problem is that it is no longer actively maintained and the JS client did even work out-of-the-box. 
    
- Voldemort 

Basically, the predecessor of Dynamodb. It looks promising, but its configuraiton is not straight forward. For a limited time, Dynamodb is a better choice.
    
### Shortest Route 

The challenge requires to find the **shortest route**. But finding the shortest route is an NP problem. So, basically, there is no known fast way to solve this optimization problem. To mitigate the problem, the number of route allowed to submit is limited to 10 by default. If approximation and heuristic could be employed, this limited could be loosed. Another way would be offload the calculation to other workers, but then it would need a message queue and worker instances. And since the challenge request horizontal scalability. The message queue need to be distributed. This complicated the system a lot.

### Routing Plan

A Routing Plan has three states.

[start] -> Raw routes -> Shortest Routes -> Guided Routes -> [done]

Raw routes: input from users
Shortest Routes: after calculating short route from distance matrix
Guided Routes: the final total distance and time 

#### Orphan Routing Plan

Orphan routing plan are defined as those plans that stay forever in `in progress`, this could happen when an instance die in the middle of processing the plan. In current implementation, if this happens, there is no mechanism to recover. One possible solution is to add a secondary index on `status` on Dynamo and spawn some workers that periodically scan through plans that are not in `done` state and have not updated for a while according to `createdAt` and `updatedAt` field. Another solution is just let client wait and submit a new request to server.



