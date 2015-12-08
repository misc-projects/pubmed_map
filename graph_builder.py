import graph
import requests
from bs4 import BeautifulSoup
import json

g = graph.Graph()

def pubmedSearch(term, max_results = 50):
	r = requests.get('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=xml&retmax=' + str(max_results) + '&sort=relevance&term=' + term)
	soup = BeautifulSoup(r.text, 'lxml')
	pid_list = [pid.text for pid in soup.find_all('id')]
	pids = ','.join(pid_list)
	return pids

def getAllPapers(pids):
	r = requests.get('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=' + pids)
	soup = BeautifulSoup(r.text, 'xml')
	papers = soup.find_all('PubmedArticle')
	return papers

def getKeywords(paper):
	keywords = [keyword.text for keyword in paper.find_all('Keyword')]
	return keywords

def getAuthors(paper):
	authors = paper.find_all('Author')
	names = []
	for author in authors:
		if author.find('LastName'):
			names.append(author.find('ForeName').text + " " + author.find('LastName').text)
		else:
			names.append(author.find('CollectiveName').text)
	return names


def graphBuilder(g, term, max_results = 10):
	search_results = getAllPapers(pubmedSearch(term, max_results))

	for paper in search_results:
		keywords = getKeywords(paper)
		authors = getAuthors(paper)

		for keyword in keywords:
			k = keyword.encode('utf-8')
			g.addNode(k, 'keyword')

			for author in authors:
				a = author.encode('utf-8')
				g.addNode(a, 'author')
				g.addLink((k, 'keyword'), (a, 'author'))
	return g



def jsonFromGraph(g):
	json = {'author': [], 'keyword': [] }

	for node in g.getAllNodes():
		json[node.getType()].append({'name': node.getName(), 'neighbours' : [neighbour.getName() for neighbour in node.getNeighbours()]})

	return json

g = graphBuilder(g, 'epigenetics richard saffery', 50)

with open('data.json', 'w') as output:
	json_output = jsonFromGraph(g)
	json.dump(json_output, output)


