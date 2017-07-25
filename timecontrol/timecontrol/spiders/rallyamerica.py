# -*- coding: utf-8 -*-
import scrapy
import re
import logging

logger = logging.getLogger(__name__)

# scrapy.shell.inspect_response(response, self)

class RallyamericaSpider(scrapy.Spider):
    name = 'rallyamerica'
    allowed_domains = ['rally-america.com']
    custom_settings = {
        'MONGO_DATABASE': 'rally',
        'MONGO_COLLECTION': 'rallyamerica',
        'ID_FIELD': 'uid',
    }

    def __init__(self, year='2017', event_code='COLO', *args, **kwargs):
        super(RallyamericaSpider, self).__init__(*args, **kwargs)

        self.year = year
        self.event_code = event_code

        root_url = 'http://www.rally-america.com/events/'
        self.results_url = root_url + year + '/' + event_code + '/results'
        self.stages_url = root_url + year + '/' + event_code + '/stages'
        
    def start_requests(self):
        yield scrapy.Request(self.results_url, callback=self.parse_results)
        yield scrapy.Request(self.stages_url, callback=self.parse_stages)

    def parse_stage(self, response):
        event_name = response.xpath('//h2[@class="content-title"]/text()[2]').extract_first().strip()
        dates = response.xpath('//div[@class="event-details"]/h3[1]/text()').extract_first().strip()
        town = response.xpath('//div[@class="event-details"]/h3[2]/text()').extract_first().strip()
        event_type = response.xpath('//div[@class="event-details"]/h5[1]/text()').extract_first().strip()
        
        title = response.xpath('//div[@class="pageHead"]/strong/text()').extract_first()
        match = re.search('Stage (\d+) - (.*)', title)
        stage_num = match.group(1)
        location = match.group(2)

        scores = response.xpath('//table[@id="stageScores"]/tbody/tr')

        for score in scores:
            position = score.xpath('.//td[1]/text()').extract_first()
            if position:
                position = position.strip()

            car_number = score.xpath('.//td[2]/text()').extract_first()
            car_class = score.xpath('.//td[3]/abbr/text()').extract_first()
            car_class_full = score.xpath('.//td[3]/abbr/@title').extract_first()

            position_in_class = score.xpath('.//td[4]/text()').extract_first()
            if position_in_class:
                position_in_class = position_in_class.strip()

            driver,codriver = score.xpath('.//td[5]/text()').extract_first().split(' / ')

            dnf = score.xpath('.//td[6]/em/text()').extract_first()

            total_time = ''
            diff_leader = ''
            diff_previous = ''

            if not dnf:
                total_time = score.xpath('.//td[6]/text()').extract_first().strip()
                diff_leader = score.xpath('.//td[7]/text()').extract_first().strip()
                diff_previous = score.xpath('.//td[8]/text()').extract_first().strip()


            yield {
                'uid': 'stage_time, {}, {}, {}, {}'.format(self.year,self.event_code,stage_num,car_number),
                'record_type': 'stage_time',
                'event': self.event_code,
                'year': self.year,
                'event_name': event_name, 
                'stage_number': stage_num, 
                'location': location,
                'dates': dates,
                'town': town,
                'event_type': event_type,
                'source url': response.url,
                'position': position,
                'car_number': car_number,
                'car_class': car_class,
                'car_class_full': car_class_full,
                'position_in_class': position_in_class,
                'driver': driver,
                'codriver': codriver,
                'dnf': dnf,
                'total_time': total_time,
                'diff_leader': diff_leader,
                'diff_previous': diff_previous,
            }

    def parse_stages(self, response):
        event_name = response.xpath('//h2[@class="content-title"]/text()[2]').extract_first().strip()
        dates = response.xpath('//div[@class="event-details"]/h3[1]/text()').extract_first().strip()
        town = response.xpath('//div[@class="event-details"]/h3[2]/text()').extract_first().strip()
        event_type = response.xpath('//div[@class="event-details"]/h5[1]/text()').extract_first().strip()

        stages = response.xpath('//table[@class="table small schedule"]/tbody/tr')
        date = ''
        for stage in stages:
            if stage.xpath('.//@class').extract_first() == 'header':
                date = stage.xpath('.//th/text()').extract_first()
            else:
                url = response.urljoin(stage.xpath('.//td[1]/a/@href').extract_first())
                stage_num = stage.xpath('.//td[1]/a/text()').extract_first()
                location = stage.xpath('.//td[2]/a/text()').extract_first()
                start = stage.xpath('.//td[3]/text()').extract_first()
                length = stage.xpath('.//td[4]/text()').extract_first()
                leader = stage.xpath('.//td[5]/text()').extract_first()

                yield scrapy.Request(url, callback=self.parse_stage)

                yield {
                    'uid': 'stage_info, {}, {}, {}'.format(self.year,self.event_code,stage_num),
                    'record_type': 'stage_info',
                    'event': self.event_code,
                    'year': self.year,
                    'event_name': event_name, 
                    'dates': dates,
                    'town': town,
                    'event_type': event_type,
                    'source url': response.url,
                    'date': date,
                    'stage url': url,
                    'stage number': stage_num,
                    'location': location,
                    'start': start,
                    'length': length,
                    'leader': leader,
                }

    def parse_results(self, response):
        #walk backwards
        prev = response.xpath('//li[@id="page-prev"]/a/@href').extract_first()
        if prev:
            print(prev)
            yield scrapy.Request(response.urljoin(prev), callback=self.parse_results)

        event_name = response.xpath('//h2[@class="content-title"]/text()[2]').extract_first().strip()
        dates = response.xpath('//div[@class="event-details"]/h3[1]/text()').extract_first().strip()
        town = response.xpath('//div[@class="event-details"]/h3[2]/text()').extract_first().strip()
        event_type = response.xpath('//div[@class="event-details"]/h5[1]/text()').extract_first().strip()

        title = response.xpath('//span[@class="head-stage"]/strong/text()').extract_first()
        match = re.search('Stage (\d+) - (.*)', title)
        stage_num = match.group(1)
        location = match.group(2)

        logger.debug("Stage: {}, Road: {}".format(stage_num,location))

        standings = response.xpath('//table[@id="stageScores"]/tbody/tr')

        for team in standings:
            position = team.xpath('.//td[1]/text()').extract_first()
            if position:
                position = position.strip()
            position_up = team.xpath('.//td[1]/span[@class="shift-up"]/text()').extract_first()
            position_down = team.xpath('.//td[1]/span[@class="shift-down"]/text()').extract_first()
            position_delta = 0
            if position_up:
                position_delta = int(position_up)
            if position_down:
                position_delta = -1 * int(position_down)

            car_number = team.xpath('.//td[2]/text()').extract_first()
            car_class = team.xpath('.//td[3]/abbr/text()').extract_first()
            car_class_full = team.xpath('.//td[3]/abbr/@title').extract_first()

            position_in_class = team.xpath('.//td[4]/text()').extract_first().strip()
            position_in_class_up = team.xpath('.//td[4]/span[@class="shift-up"]/text()').extract_first()
            position_in_class_down = team.xpath('.//td[4]/span[@class="shift-down"]/text()').extract_first()
            position_in_class_delta = 0
            if position_in_class_up:
                position_in_class_delta = int(position_in_class_up)
            if position_in_class_down:
                position_in_class_delta = -1 * int(position_in_class_down)

            driver = team.xpath('.//td[5]/a[1]/text()').extract_first()
            driver_url = response.urljoin(team.xpath('.//td[5]/a[1]/@href').extract_first())
            codriver = team.xpath('.//td[5]/a[2]/text()').extract_first()
            codriver_url = response.urljoin(team.xpath('.//td[5]/a[2]/@href').extract_first())

            car = team.xpath('.//td[5]/text()').extract()[1].strip()

            dnf = team.xpath('.//td[6]/em/text()').extract_first()

            total_time = ''
            penalties = []
            total_penalty_time = ''
            diff_leader = ''
            diff_previous = ''

            if not dnf:
                total_time = team.xpath('.//td[6]/text()').extract_first()

                if total_time:
                    total_time = total_time.strip()
                else:
                    total_time = ''

                if len(total_time) == 0:
                    #penalties
                    total_time = team.xpath('.//td[6]/label/a/text()').extract_first()
                    descriptions = team.xpath('.//td[6]/div/span[@class="table small"]/text()').extract()
                    times = team.xpath('.//td[6]/div/span[@class="time"]/text()').extract()
                    penalties = list(zip(descriptions[:-1], times[:-1]))
                    total_penalty_time = times[-1]

                diff_leader = team.xpath('.//td[7]/text()').extract_first().strip()
                diff_previous = team.xpath('.//td[8]/text()').extract_first().strip()


            yield {
                'uid': 'standing, {}, {}, {}, {}'.format(self.year,self.event_code,stage_num,car_number),
                'record_type': 'standing',
                'event': self.event_code,
                'year': self.year,
                'event_name': event_name, 
                'stage_number': stage_num, 
                'location': location,
                'dates': dates,
                'town': town,
                'event_type': event_type,
                'source_url': response.url,
                'position': position,
                'position_delta': position_delta,
                'car_number': car_number,
                'car_class': car_class,
                'car_class_full': car_class_full,
                'position_in_class': position_in_class,
                'position_in_class_delta': position_in_class_delta,
                'driver': driver,
                'driver_url': driver_url,
                'codriver': codriver,
                'codriver_url': codriver_url,
                'car': car,
                'dnf': dnf,
                'total_time': total_time,
                'total_penalty_time': total_penalty_time,
                'penalties': penalties,
                'diff_leader': diff_leader,
                'diff_previous': diff_previous
            }
