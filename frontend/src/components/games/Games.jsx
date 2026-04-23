import React from 'react'

export const Games = () => {
 const pointsBuy = [
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "100 + 10",
    price: ""
  },
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "310 + 31",
    price: ""
  },
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "520 + 52",
    price: ""
  },
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "1060 + 106",
    price: ""
  },
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "2180 + 218",
    price: ""
  },
  {
    img: "https://imgs.search.brave.com/qVJeB3VMH8M37PjcUk__iTRFS7nLbZ1Gq0l5-RX7dGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/d3d3LmJsdWVzdGFj/a3MuY29tL2JzLWlt/YWdlcy9GcmVlRmly/ZV9HdWlkZV9EaWFt/b25kc0d1aWRlX0VT/XzIuanBn",
    points: "5600 + 560",
    price: ""
  }
 ]
  return (
   <>



   <input type="text" placeholder='Introduce el ID del jugador aqui' />
   <button>Enviar</button>
   {
    pointsBuy.map((item)=>(

      
      
      <div>
        <img src={item.img} alt="" />
      {item.points}
      </div>
    
  )
  
  
)}
  </>
  )
}
