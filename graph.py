class Graph(object):

	def __init__(self, node_list = []):
		self.graph = node_list

	def findNode(self, name):
		for node in self.graph:
			if node.getName().lower() == name.lower():
				return node

	def addNode(self, name, node_type):
		node = self.findNode(name)
		if node is not None:
			node.addScore()
		else:
			self.graph.append(Node(name, node_type))

	def addLink(self, name, neighbour_name):
		self.addNode(name[0], name[1])
		self.addNode(neighbour_name[0], neighbour_name[1])
		node = self.findNode(name[0])
		neighbour = self.findNode(neighbour_name[0])
		node.addNeighbour(neighbour)
		neighbour.addNeighbour(node)

	def getLinkList(self, source_type = None):
		links = []
		for node in self.graph:
			for neighbour in node.getNeighbours():
				link = (node, neighbour) if source_type == node.getType() else (neighbour, node)
				links.append(link)				
		return links

	def getUniqueLinks(self, link_list):
		unique_links = []
		link_set = set(link_list)
		for link in link_set:
			unique_links.append( {link[0].getType(): link[0].getName(), link[1].getType(): link[1].getName(), 'score': link_list.count(link) / 2} )
		return unique_links

	def getAllNodes(self):
		return self.graph

	def __str__(self):
		s = ""
		for node in self.graph:
			s += str(node)
		return s


class Node(object):

	def __init__(self, name, node_type = None):
		self.name = name
		self.neighbours = []
		self.score = 1
		self.node_type = node_type

	def getName(self):
		return self.name

	def getNeighbours(self):
		return self.neighbours

	def getScore(self):
		return self.score

	def getType(self):
		return self.node_type

	def getNumNeighbours(self):
		return len(self.neighbours)

	def addNeighbour(self, neighbour):
		self.neighbours.append(neighbour)

	def addScore(self):
		self.score += 1

	def __eq__(self, other):
		return self.name == other.getName() and self.type == other.getType()

	def __str__(self):
		s = self.getType() + " { " + self.getName() + " (" + str(self.getScore()) + "): " 
		for neighbour in self.neighbours:
			s += str(neighbour.getName()) + ", "
		s = s[:-2] + " }\n"
		return s